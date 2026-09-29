import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { expect, test } from "vitest";
import {
  findInternalMembers,
  publicMembersOnly,
  tagInternalMembers,
} from "./public-members";

const source = `export class Model {
  public readonly id = 1;
  count = 0;
  public static create() { return new Model(); }
  static cache = new Map();
  public method() {}
  internalMethod() {}
  protected protectedMethod() {}
  private privateMethod() {}
  #hidden = 0;
  public get size() { return 1; }
  constructor(public x = 1, readonly y = 2, z = 3) {}
}

export class Untouched {
  method() {}
}`;

// What tsc emits for it: `public` is gone.
const declarations = `export declare class Model {
    x: number;
    readonly y: number;
    #private;
    readonly id = 1;
    count: number;
    static create(): Model;
    static cache: Map<any, any>;
    method(): void;
    internalMethod(): void;
    protected protectedMethod(): void;
    private privateMethod;
    get size(): number;
    constructor(x?: number, y?: number, z?: number);
}
export declare class Untouched {
    method(): void;
}
`;

test("a class that marks members public leaves the unmarked ones out", () => {
  const internal = findInternalMembers("model.ts", source);

  expect(internal).toEqual(
    new Map([
      ["Model", new Set(["y", "count", "static cache", "internalMethod"])],
    ]),
  );
});

test("tags the unmarked members @internal in the declarations", () => {
  const internal = findInternalMembers("model.ts", source);

  const { content, tagged } = tagInternalMembers(
    "model.d.ts",
    declarations,
    internal,
  );

  expect(tagged).toEqual(
    new Map([["Model", ["y", "count", "cache", "internalMethod"]]]),
  );
  expect(content).toBe(`export declare class Model {
    x: number;
    /** @internal */ readonly y: number;
    #private;
    readonly id = 1;
    /** @internal */ count: number;
    static create(): Model;
    /** @internal */ static cache: Map<any, any>;
    method(): void;
    /** @internal */ internalMethod(): void;
    protected protectedMethod(): void;
    private privateMethod;
    get size(): number;
    constructor(x?: number, y?: number, z?: number);
}
export declare class Untouched {
    method(): void;
}
`);
});

test("a release tag in a member's doc comment wins", () => {
  const internal = new Map([["Model", new Set(["internalMethod"])]]);
  const content = `export declare class Model {
    /** @public */
    internalMethod(): void;
}`;

  expect(tagInternalMembers("model.d.ts", content, internal).content).toBe(
    content,
  );
});

test("the hook reads public from the source each declaration comes from", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "public-members-"));
  const sourceDir = path.join(root, "src");
  const declarationDir = path.join(root, "dist");
  fs.mkdirSync(path.join(sourceDir, "model"), { recursive: true });
  fs.writeFileSync(path.join(sourceDir, "model", "model.ts"), source);
  const logged: string[] = [];
  const hook = publicMembersOnly({
    sourceDir,
    declarationDir,
    log: (message) => logged.push(message),
  });

  const result = hook(
    path.join(declarationDir, "model", "model.d.ts"),
    declarations,
  );
  const unknown = hook(path.join(declarationDir, "other.d.ts"), declarations);

  expect(result?.content).toContain("/** @internal */ internalMethod(): void;");
  expect(logged).toEqual([
    "[public members] Model leaves out y, count, cache, internalMethod",
  ]);
  expect(unknown).toBeUndefined();
  fs.rmSync(root, { recursive: true });
});
