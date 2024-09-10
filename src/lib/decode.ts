import { canonize } from "./canonize";
import { Command } from "./Command.";
import { Coord } from "./Coord";
import { Direction } from "./Direction";
import { normalize } from "./normalize";
import { turnL } from "./turnL";
import { turnR } from "./turnR";

export interface DecodeOptions {
  startDirection: Direction;
  startCcw: boolean;
  useQueueInsteadOfStack: boolean;
}

interface BackStackElement {
  direction: Direction;
  x: number;
  y: number;
}

const coord: Record<Direction, Coord> = {
  up: [0, 1],
  right: [1, 0],
  down: [0, -1],
  left: [-1, 0],
};

export function decode(
  commands: Command[],
  { startDirection, startCcw, useQueueInsteadOfStack }: DecodeOptions
): Coord[] {
  const grid: Partial<Record<number, Partial<Record<number, true>>>> = {};
  const backStack: BackStackElement[] = [];
  let direction = startCcw ? turnR[startDirection] : turnL[startDirection];
  let x = 0;
  let y = 0;

  (grid[y] ??= {})[x] = true;
  for (const command of commands) {
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
      backStack.push({ direction, x, y });
    } else {
      const popped = useQueueInsteadOfStack
        ? backStack.shift()
        : backStack.pop();
      if (!popped) continue;
      ({ direction, x, y } = popped);
    }
  }

  const minY = Math.min(...Object.keys(grid).map((key) => parseInt(key)));
  const minX = Math.min(
    ...Object.entries(grid).map(([_, value]) =>
      Math.min(...Object.keys(value!).map((key) => parseInt(key)))
    )
  );
  return canonize(
    normalize(
      Object.entries(grid).flatMap(([key, value]) => {
        const y = parseInt(key);
        return Object.keys(value!).map(
          (key) => [parseInt(key) - minX, y - minY] as Coord
        );
      })
    )
  );
}
