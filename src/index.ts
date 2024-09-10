import { createReadStream } from "fs";
import { createInterface } from "readline";
import { Coord } from "./lib/Coord";
import { decode, DecodeOptions } from "./lib/decode";
import { encode } from "./lib/encode";

(async function main() {
  const defaultOptions: DecodeOptions = {
    startDirection: "left",
    startCcw: true,
    useQueueInsteadOfStack: false,
  };
  const fileStream = createReadStream("./test.txt");

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let error = 0;
  let ok = 0;

  for await (const line of rl) {
    const polyomino: Coord[] = JSON.parse(line);
    const encoded = encode(polyomino, defaultOptions);
    const decoded = decode(encoded, defaultOptions);
    if (JSON.stringify(polyomino) !== JSON.stringify(decoded)) {
      console.log(
        `Error: ${JSON.stringify(polyomino)} !== ${JSON.stringify(decoded)}`
      );
      error++;
    } else {
      ok++;
    }
  }

  console.log({ error, ok });
})();
