/* eslint-disable import/no-extraneous-dependencies */
import * as fs from "fs";
import * as path from "path";
import ts from "typescript";

// A class that marks any member `public` publishes only those: its members
// without an access modifier stay usable inside the library but are left out
// of the published types. Classes that mark nothing `public` are unaffected.

// Doc comment tags that decide a member's release on their own.
const releaseTags = new Set(["public", "internal", "alpha", "beta"]);

const accessOf = (node: ts.Node) => {
  const modifiers = (ts.canHaveModifiers(node) && ts.getModifiers(node)) || [];
  for (const { kind } of modifiers) {
    if (kind === ts.SyntaxKind.PublicKeyword) return "public";
    if (kind === ts.SyntaxKind.ProtectedKeyword) return "protected";
    if (kind === ts.SyntaxKind.PrivateKeyword) return "private";
  }
  return undefined;
};

const isStatic = (node: ts.Node) =>
  ts.canHaveModifiers(node) &&
  !!ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);

// Tells apart a static member from an instance one of the same name.
const keyOf = (node: ts.Node, name: string) =>
  `${isStatic(node) ? "static " : ""}${name}`;

const nameOf = (node: ts.ClassElement | ts.ParameterDeclaration) =>
  node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ? node.name.text
    : undefined;

// The members of a class that declare an access, and those that don't.
function membersOf(node: ts.ClassDeclaration) {
  const members: { key: string; access?: string }[] = [];
  for (const member of node.members) {
    if (ts.isConstructorDeclaration(member)) {
      // Parameter properties, e.g. `constructor(public x: number)`.
      for (const parameter of member.parameters) {
        const name = nameOf(parameter);
        const access = accessOf(parameter);
        const isProperty =
          access || ts.getModifiers(parameter)?.length || undefined;
        if (name && isProperty) members.push({ key: name, access });
      }
      continue;
    }
    const name = nameOf(member);
    if (name)
      members.push({ key: keyOf(member, name), access: accessOf(member) });
  }
  return members;
}

/**
 * Finds, in a source file, the members each class leaves out of the published
 * types: in a class that marks any member `public`, the members without an
 * access modifier.
 */
export function findInternalMembers(fileName: string, source: string) {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest);
  const internal = new Map<string, Set<string>>();
  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const members = membersOf(node);
      const published = new Set(
        members.filter((m) => m.access === "public").map((m) => m.key),
      );
      if (published.size) {
        const unmarked = members
          .filter((m) => !m.access && !published.has(m.key))
          .map((m) => m.key);
        if (unmarked.length) internal.set(node.name.text, new Set(unmarked));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return internal;
}

/**
 * Tags the given members of each class of a declaration file `@internal`, so
 * the declaration rollup (API Extractor's public-trimmed one, which
 * vite-plugin-dts writes) leaves them out. A member whose doc comment already
 * has a release tag keeps it.
 */
export function tagInternalMembers(
  fileName: string,
  declarations: string,
  internal: Map<string, Set<string>>,
) {
  const file = ts.createSourceFile(
    fileName,
    declarations,
    ts.ScriptTarget.Latest,
    true,
  );
  const positions: number[] = [];
  const tagged = new Map<string, string[]>();
  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const members = internal.get(node.name.text);
      for (const member of members ? node.members : []) {
        const name = nameOf(member);
        if (!name || !members!.has(keyOf(member, name))) continue;
        const tags = ts.getJSDocTags(member);
        if (tags.some((tag) => releaseTags.has(tag.tagName.text))) continue;
        positions.push(member.getStart(file));
        const names = tagged.get(node.name.text) ?? [];
        if (!names.includes(name)) names.push(name);
        tagged.set(node.name.text, names);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);

  // The tag goes in a comment of its own, right before the member: API
  // Extractor reads the last doc comment, and the member is left out anyway.
  let content = declarations;
  for (const position of positions.sort((a, b) => b - a)) {
    content = `${content.slice(0, position)}/** @internal */ ${content.slice(position)}`;
  }
  return { content, tagged };
}

/**
 * vite-plugin-dts's `beforeWriteFile` hook, which runs on each declaration
 * file before the rollup reads it. Declaration files drop `public`, so the
 * hook reads it from the source file each one is emitted from.
 *
 * @param sourceDir - The directory the declarations are emitted from.
 * @param declarationDir - The directory they are emitted to.
 */
export function publicMembersOnly({
  sourceDir,
  declarationDir,
  log = console.log,
}: {
  sourceDir: string;
  declarationDir: string;
  log?: (message: string) => void;
}) {
  return (filePath: string, content: string) => {
    if (!filePath.endsWith(".d.ts")) return undefined;
    const relative = path.relative(declarationDir, filePath);
    const sourcePath = path.join(
      sourceDir,
      relative.replace(/\.d\.ts$/, ".ts"),
    );
    if (!fs.existsSync(sourcePath)) return undefined;
    const source = fs.readFileSync(sourcePath, "utf-8");
    const internal = findInternalMembers(sourcePath, source);
    if (!internal.size) return undefined;
    const result = tagInternalMembers(filePath, content, internal);
    for (const [name, members] of result.tagged) {
      log(`[public members] ${name} leaves out ${members.join(", ")}`);
    }
    return { content: result.content };
  };
}
