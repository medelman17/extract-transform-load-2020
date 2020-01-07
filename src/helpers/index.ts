import * as fs from "fs";
import { Writable, Readable } from "stream";
import * as readline from "readline";
const uuid = require("uuid/v4");

export function createStreams(path: fs.PathLike): [Readable, Writable] {
  return [fs.createReadStream(path), new Writable()];
}

export function getReadline(instream: Readable, outstream: Writable) {
  return readline.createInterface(instream, outstream);
}

export function createCharJob(line: string) {
  return { data: line, id: uuid() as string };
}
