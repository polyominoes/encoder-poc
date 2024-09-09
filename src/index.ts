import { createReadStream } from "fs";
import { createInterface } from "readline";
import { Coord } from "./Coord";
import { decode } from "./decode";
import { encode } from "./encode";

(async function main() {
  const fileStream = createReadStream("./test.txt");

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let error = 0;
  let ok = 0;

  for await (const line of rl) {
    const polyomino: Coord[] = JSON.parse(line);
    const encoded = encode(polyomino);
    const decoded = encode(decode(encoded));

    if (compareUint8Arrays(encoded, decoded)) {
      error++;
      console.log("Error: encoded/decoded mismatch", {
        polyomino,
        encoded,
        decoded,
      });
    } else {
      ok++;
      console.log("OK");
    }
  }
  console.log({ error, ok });
})();

function compareUint8Arrays(a: Uint8Array, b: Uint8Array): number {
  const minLength = Math.min(a.length, b.length);
  for (let i = 0; i < minLength; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}
