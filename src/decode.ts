import { Coord } from "./Coord";
import { EncodeConfig } from "./encodeWithConfig";
import { normalize } from "./normalize";

type Direction = "up" | "right" | "down" | "left";
type Command = "forward" | "turnRight" | "turnLeft" | "push" | "pop";

function bufferToCommands(buffer: Uint8Array): Command[] {
  let bits = "";

  for (let byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  const commands: Command[] = [];
  let i = 8;

  while (i < bits.length) {
    if (bits.slice(i, i + 4) === "1111") {
      commands.push("pop");
      i += 4;
    } else if (bits.slice(i, i + 2) === "00") {
      commands.push("forward");
      i += 2;
    } else if (bits.slice(i, i + 2) === "01") {
      commands.push("turnRight");
      i += 2;
    } else if (bits.slice(i, i + 2) === "10") {
      commands.push("turnLeft");
      i += 2;
    } else if (bits.slice(i, i + 2) === "11") {
      commands.push("push");
      i += 2;
    } else {
      break;
    }
  }

  return commands;
}

function decodeOption(optionIndex: number): EncodeConfig {
  let i = 0;
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
              if (optionIndex === i)
                return {
                  useQueueInsteadOfStack,
                  relative,
                  ccw,
                  firstDirection,
                  startDirection,
                  startRight,
                };
              i++;
            }
          }
        }
      }
    }
  }
  throw new Error("Invalid option index");
}

const turnR: Record<Direction, Direction> = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
};

const turnL: Record<Direction, Direction> = {
  up: "left",
  left: "down",
  down: "right",
  right: "up",
};

const coord: Record<Direction, Coord> = {
  up: [0, 1],
  right: [1, 0],
  down: [0, -1],
  left: [-1, 0],
};

interface BackStackElement {
  direction: Direction;
  coord: Coord;
}

export function decode(buffer: Uint8Array): Coord[] {
  const {
    useQueueInsteadOfStack,
    relative,
    ccw,
    firstDirection,
    startDirection,
    startRight,
  } = decodeOption(buffer[0]);
  const grid: Partial<Record<number, Partial<Record<number, true>>>> = {};
  const backStack: BackStackElement[] = [];
  let x = 0;
  let y = 0;
  let direction = startRight ? turnL[startDirection] : turnR[startDirection];

  (grid[y] ??= {})[x] = true;
  for (const command of bufferToCommands(buffer)) {
    if (
      command === "forward" ||
      command === "turnLeft" ||
      command === "turnRight"
    ) {
      if (command === "turnLeft") {
        direction = turnL[direction];
      } else if (command === "turnRight") {
        direction = turnR[direction];
      }
      const [dx, dy] = coord[direction];
      while (grid[y]?.[x] === true) {
        x += dx;
        y += dy;
      }
      (grid[y] ??= {})[x] = true;
    } else if (command === "push") {
      backStack.push({ direction, coord: [x, y] });
    } else {
      const popped = useQueueInsteadOfStack
        ? backStack.shift()
        : backStack.pop();
      if (!popped) continue;
      direction = popped.direction;
      [x, y] = popped.coord;
    }
  }
  const minY = Math.min(...Object.keys(grid).map((key) => parseInt(key)));
  const minX = Math.min(
    ...Object.entries(grid).map(([_, value]) =>
      Math.min(...Object.keys(value!).map((key) => parseInt(key)))
    )
  );
  return normalize(
    Object.entries(grid).flatMap(([key, value]) => {
      const y = parseInt(key);
      return Object.keys(value!).map((key) => [parseInt(key), y] as Coord);
    })
  );
}
