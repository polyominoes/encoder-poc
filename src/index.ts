import { Coord } from "./lib/Coord";
import { decode, DecodeOptions } from "./lib/decode";
import { encode } from "./lib/encode";

(async function main() {
  const defaultOptions: DecodeOptions = {
    startDirection: "left",
    startCcw: true,
    useQueueInsteadOfStack: false,
  };
  const polyomino: Coord[] = [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 0],
    [3, 1],
    [3, 2],
    [4, 0],
    [4, 1],
  ];
  const encoded = encode(polyomino, defaultOptions);
  const decoded = decode(encoded, defaultOptions);
  if (JSON.stringify(polyomino) !== JSON.stringify(decoded)) {
    console.log(
      `Error: ${JSON.stringify(polyomino)} !== ${JSON.stringify(decoded)}`
    );
  }
})();
