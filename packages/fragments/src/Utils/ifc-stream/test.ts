#!/usr/bin/env node
import { openAsBlob } from "fs";
import * as path from "path";
import { IfcDecoderStream } from "./ifc-decoder";
import { IfcParserStream } from "./ifc-parser";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: ifc-parser <input.ifc>");
  console.log("  Example: ifc-parser model.ifc");
  process.exit(0);
}

const inputPath = path.resolve(args[0]);

try {
  const stream = (await openAsBlob(inputPath, { type: "text/plain" }))
    .stream()
    .pipeThrough(new IfcDecoderStream())
    .pipeThrough(new IfcParserStream());

  for await (const entity of stream) {
    console.log(entity);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
