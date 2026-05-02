import * as webIfc from "web-ifc";

export interface LineMeta {
  id: number;
  type: string;
}

export function extractLineMeta(raw: string): LineMeta | null {
  if (raw.charCodeAt(0) !== 35) return null; // '#'
  let id = 0;
  let i = 1;
  while (i < raw.length) {
    const c = raw.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      id = id * 10 + (c - 48);
      i++;
    } else break;
  }
  if (id === 0) return null;
  while (i < raw.length && raw.charCodeAt(i) <= 32) i++;
  if (raw.charCodeAt(i) !== 61) return null; // '='
  i++;
  while (i < raw.length && raw.charCodeAt(i) <= 32) i++;
  const ts = i;
  while (i < raw.length) {
    const c = raw.charCodeAt(i);
    if ((c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 95) i++;
    else break;
  }
  if (i === ts) return null;
  return { id, type: raw.substring(ts, i) };
}

// STEP tape type codes (mirrors web-ifc internals)
const STEP_STRING = 1; // 'foo'
const STEP_LABEL = 2; // IFCLABEL('foo') — typed value / select
const STEP_ENUM = 3; // .SOMEVALUE.
const STEP_REAL = 4; // 3.14
const STEP_REF = 5; // #123
const STEP_EMPTY = 6; // $
const STEP_INT = 10; // 42

type TapeItem =
  | { type: 1 | 2 | 3; value: string; name?: string }
  | { type: 4 | 10; value: number }
  | { type: 5; value: number }
  | { type: 6; value: null }
  | TapeItem[];

/** Recursive descent through a STEP token stream. */
function parseList(
  src: string,
  pos: number,
  end: number,
): { items: TapeItem[]; pos: number } {
  const items: TapeItem[] = [];

  while (pos < end) {
    // skip whitespace and commas
    while (pos < end && (src[pos] === "," || src[pos] === " ")) pos++;
    if (pos >= end) break;

    const ch = src[pos];

    if (ch === "$") {
      // omitted / null attribute
      items.push({ type: STEP_EMPTY, value: null });
      pos++;
    } else if (ch === "*") {
      // redeclared attribute (treat same as omitted)
      items.push({ type: STEP_EMPTY, value: null });
      pos++;
    } else if (ch === "#") {
      // entity reference: #12345
      pos++;
      let numStr = "";
      while (pos < end && src[pos] >= "0" && src[pos] <= "9")
        numStr += src[pos++];
      items.push({ type: STEP_REF, value: parseInt(numStr, 10) });
    } else if (ch === ".") {
      // enum: .SOMEVALUE.
      pos++;
      let name = "";
      while (pos < end && src[pos] !== ".") name += src[pos++];
      pos++; // consume closing "."
      items.push({ type: STEP_ENUM, value: name });
    } else if (ch === "'") {
      // string: 'hello world'  ('' is an escaped single quote)
      pos++;
      let value = "";
      while (pos < end) {
        if (src[pos] === "'" && src[pos + 1] === "'") {
          value += "'";
          pos += 2;
        } else if (src[pos] === "'") {
          pos++;
          break;
        } else {
          value += src[pos++];
        }
      }
      items.push({ type: STEP_STRING, value });
    } else if (ch === "(") {
      // aggregate / list: (item, item, ...)
      const inner = parseList(src, pos + 1, end);
      pos = inner.pos + 1; // skip closing ")"
      items.push(inner.items as unknown as TapeItem);
    } else if (
      ch === "-" ||
      (ch >= "0" && ch <= "9") ||
      src.slice(pos, pos + 2).toUpperCase() === "1." || // guard for numbers starting with digit
      false
    ) {
      // numeric: integer or real
      let numStr = "";
      if (ch === "-") {
        numStr += "-";
        pos++;
      }
      while (
        pos < end &&
        ((src[pos] >= "0" && src[pos] <= "9") ||
          src[pos] === "." ||
          src[pos] === "E" ||
          src[pos] === "e" ||
          src[pos] === "+" ||
          src[pos] === "-")
      ) {
        numStr += src[pos++];
      }
      const isReal = numStr.includes(".") || numStr.toUpperCase().includes("E");
      items.push(
        isReal
          ? { type: STEP_REAL, value: parseFloat(numStr) }
          : { type: STEP_INT, value: parseInt(numStr, 10) },
      );
    } else if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      // typed value / select: IFCLABEL('foo') or IFCLENGTHMEASURE(3.14)
      let name = "";
      while (pos < end && src[pos] !== "(") name += src[pos++];
      pos++; // consume "("
      const inner = parseList(src, pos, end);
      pos = inner.pos + 1; // skip ")"
      // A typed value wraps a single primitive as a LABEL tape item
      items.push({ type: STEP_LABEL, value: inner.items[0] as any, name });
    } else {
      pos++; // skip unexpected character
    }
  }

  return { items, pos };
}

/** Parse the argument list of a STEP data line into a web-ifc tape. */
function parseStepArguments(line: string): TapeItem[] {
  // Extract the argument substring: #ID=TYPENAME(args);
  const start = line.indexOf("(");
  const end = line.lastIndexOf(")");
  if (start === -1 || end === -1) return [];
  return parseList(line, start + 1, end).items;
}

/**
 *
 * @example
 * ```ts
 * let blob: Blob;
 *
 * const ifcStream = blob
 *   .stream()
 *   .pipeThrough(new IfcDecoderStream())
 *   .pipeThrough(new IfcParserStream());
 *
 * for await (const entity of ifcStream) {
 *   const localId = entity.expressID;
 *   const type = entity.type;
 * }
 * ```
 *
 * @example node
 * ```ts
 * let blob = await fs.openAsBlob(path, { type: "text/plain" });
 * ```
 */
export class IfcParserStream extends TransformStream<
  string,
  webIfc.IfcLineObject
> {
  constructor() {
    let schemaFactoryMap: Record<number, (...args: unknown[]) => any> | null =
      null;
    let section: "header" | "data" | "footer" = "header";
    const header: string[] = [];
    const schemaRE = /FILE_SCHEMA\(+'?([^')]*)'?\)+;/;

    function getFactory(type: string): ((line: string) => any) | null {
      if (!schemaFactoryMap) return null;

      const typeCode = (webIfc as Record<string, unknown>)[type];
      if (typeof typeCode !== "number") return null;

      const ctor = schemaFactoryMap[typeCode];
      if (!ctor) return null;

      return (line: string) => {
        const args = parseStepArguments(line);
        return ctor(args);
      };
    }

    super({
      transform(line, controller) {
        switch (section) {
          case "header":
            if (line.trim() === "DATA;") {
              const schemaLine = header.find((line) => schemaRE.test(line));
              const schema = schemaLine && schemaRE.exec(schemaLine)?.[1];
              if (!schema) {
                controller.error("Ifc schema not found");
                return;
              }
              const schemaIndex = webIfc.SchemaNames.findIndex((names) =>
                names?.includes(schema),
              );
              if (schemaIndex === -1) {
                controller.error(`Ifc schema '${schema}' not found`);
                return;
              }
              schemaFactoryMap = webIfc.Constructors[schemaIndex];
              section = "data";
              return;
            }
            header.push(line);
            break;

          case "data":
            {
              if (line.trim() === "ENDSEC;") {
                section = "footer";
                return;
              }
              const result = extractLineMeta(line);
              if (!result) {
                controller.error(`Ifc corrupted line: ${line}`);
                return;
              }
              const factory = getFactory(result.type);
              if (!factory) {
                controller.error(`Unknown Ifc type '${result.type}'`);
                return;
              }
              const entity = factory(line);
              entity.expressID = result.id;
              controller.enqueue(entity);
            }
            break;

          default:
            break;
        }
      },
    });
  }
}
