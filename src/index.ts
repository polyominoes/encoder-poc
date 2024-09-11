import { createReadStream } from "fs";
import { createInterface } from "readline";
import { Coord } from "./lib/Coord";
import { decode, DecodeOptions } from "./lib/decode";
import { encode, EncodeOptions } from "./lib/encode";

const decodeOptions: DecodeOptions[] = (
  ["up", "right", "down", "left"] as const
).flatMap((startDirection) => [
  {
    startDirection,
    startCcw: false,
    useQueueInsteadOfStack: false,
  },
  {
    startDirection,
    startCcw: false,
    useQueueInsteadOfStack: true,
  },
  {
    startDirection,
    startCcw: true,
    useQueueInsteadOfStack: false,
  },
  {
    startDirection,
    startCcw: true,
    useQueueInsteadOfStack: true,
  },
]);

const encodeOptions: EncodeOptions[] = [
  ...(
    [
      ["up", "right", "down", "left"],
      ["up", "right", "left", "down"],
      ["up", "down", "right", "left"],
      ["up", "down", "left", "right"],
      ["up", "left", "right", "down"],
      ["up", "left", "down", "right"],
      ["right", "down", "left", "up"],
      ["right", "down", "up", "left"],
      ["right", "left", "down", "up"],
      ["right", "left", "up", "down"],
      ["right", "up", "down", "left"],
      ["right", "up", "left", "down"],
      ["down", "left", "up", "right"],
      ["down", "left", "right", "up"],
      ["down", "up", "left", "right"],
      ["down", "up", "right", "left"],
      ["down", "right", "left", "up"],
      ["down", "right", "up", "left"],
      ["left", "up", "right", "down"],
      ["left", "up", "down", "right"],
      ["left", "right", "up", "down"],
      ["left", "right", "down", "up"],
      ["left", "down", "up", "right"],
      ["left", "down", "right", "up"],
    ] as const
  ).map(
    (directions) =>
      ({
        preferredDirection: {
          type: "absolute",
          directions,
        },
      } as const)
  ),
  ...(
    [
      ["forward", "turnLeft", "turnRight"],
      ["forward", "turnRight", "turnLeft"],
      ["turnLeft", "forward", "turnRight"],
      ["turnLeft", "turnRight", "forward"],
      ["turnRight", "forward", "turnLeft"],
      ["turnRight", "turnLeft", "forward"],
    ] as const
  ).map(
    (commands) =>
      ({ preferredDirection: { type: "relative", commands } } as const)
  ),
];

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
    for (const decodeOption of decodeOptions) {
      for (const encodeOption of encodeOptions) {
        const encoded = encode(polyomino, decodeOption, encodeOption);
        const decoded = decode(encoded, decodeOption);
        if (JSON.stringify(polyomino) !== JSON.stringify(decoded)) {
          console.log(
            `Error: ${JSON.stringify(polyomino)} !== ${JSON.stringify(decoded)}`
          );
          error++;
        } else {
          ok++;
        }
      }
    }
    // console.log(`Done (${(ok + error) / 480}): ${JSON.stringify(polyomino)}`);
  }

  console.log({ error, ok });
})();
