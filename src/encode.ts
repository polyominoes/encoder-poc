import { Coord } from "./Coord";
import { EncodeConfig, encodeWithConfig } from "./encodeWithConfig";

export function encode(polyomino: Coord[]): Uint8Array {
  let bestEncoding: Uint8Array | null = null;

  for (const useQueueInsteadOfStack of [false, true]) {
    for (const relative of [false, true]) {
      for (const ccw of [false, true]) {
        for (const firstDirection of ["up", "right", "down", "left"] as const) {
          for (const startDirection of [
            "up",
            "right",
            "down",
            "left",
          ] as const) {
            for (const startRight of [false, true]) {
              const config: EncodeConfig = {
                useQueueInsteadOfStack,
                relative,
                ccw,
                firstDirection,
                startDirection,
                startRight,
              };

              const encoded = encodeWithConfig(polyomino, config);

              if (
                bestEncoding === null ||
                encoded.length < bestEncoding.length ||
                (encoded.length === bestEncoding.length &&
                  compareUint8Arrays(encoded, bestEncoding) < 0)
              ) {
                bestEncoding = encoded;
              }
            }
          }
        }
      }
    }
  }

  return bestEncoding!;
}

function compareUint8Arrays(a: Uint8Array, b: Uint8Array): number {
  const minLength = Math.min(a.length, b.length);
  for (let i = 0; i < minLength; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}
