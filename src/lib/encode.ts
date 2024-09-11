import { Command } from "./Command.";
import { Coord } from "./Coord";
import { DecodeOptions } from "./decode";
import { Direction } from "./Direction";
import { turnL } from "./turnL";
import { turnR } from "./turnR";

type CellState = "E" | "F" | "P"; // empty, filled, processed
type Availabilily = Record<Direction, boolean>;

interface BackStackElement {
  removeHandle: Record<"command", Command>;
  direction: Direction;
  coord: Coord;
}

const coord: Record<Direction, Coord> = {
  up: [0, 1],
  right: [1, 0],
  down: [0, -1],
  left: [-1, 0],
};

export interface EncodeOptions {
  preferredDirection:
    | { type: "absolute"; directions: readonly Direction[] }
    | {
        type: "relative";
        commands: readonly ("forward" | "turnLeft" | "turnRight")[];
      };
}

export function encode(
  normalizedPolyomino: Coord[],
  { startDirection, startCcw, useQueueInsteadOfStack }: DecodeOptions,
  { preferredDirection }: EncodeOptions
): Command[] {
  const grid = (function getGrid() {
    const height = Math.max(...normalizedPolyomino.map(([_, y]) => y)) + 1;
    const width = Math.max(...normalizedPolyomino.map(([x]) => x)) + 1;
    const result: CellState[][] = Array.from(new Array(height)).map(() =>
      Array.from(new Array(width)).map(() => "E")
    );
    normalizedPolyomino.forEach(([x, y]) => (result[y][x] = "F"));
    return result;
  })();

  let direction = startCcw ? turnR[startDirection] : turnL[startDirection];
  let [x, y] = (function getStartingPoint(): Coord {
    if (startDirection === "left" && startCcw) {
      return [0, grid.findIndex(([cell]) => cell === "F")];
    } else if (startDirection === "left" && !startCcw) {
      return [
        0,
        grid.reduce((acc, [cell], i) => (cell === "F" ? i : acc), NaN),
      ];
    } else if (startDirection === "up" && startCcw) {
      return [grid[grid.length - 1].indexOf("F"), grid.length - 1];
    } else if (startDirection === "up" && !startCcw) {
      return [grid[grid.length - 1].lastIndexOf("F"), grid.length - 1];
    } else if (startDirection === "right" && startCcw) {
      return [
        grid[0].length - 1,
        grid.reduce(
          (acc, curr, i) => (curr[curr.length - 1] === "F" ? i : acc),
          NaN
        ),
      ];
    } else if (startDirection === "right" && !startCcw) {
      return [
        grid[0].length - 1,
        grid.findIndex((row) => row[row.length - 1] === "F"),
      ];
    } else if (startDirection === "down" && startCcw) {
      return [grid[0].lastIndexOf("F"), 0];
    } else {
      return [grid[0].indexOf("F"), 0];
    }
  })();

  function isUpAvailable(): boolean {
    for (let newY = y + 1; newY < grid.length; newY++) {
      if (grid[newY][x] === "E") return false;
      if (grid[newY][x] === "F") return true;
    }
    return false;
  }

  function isRightAvailable(): boolean {
    for (let newX = x + 1; newX < grid[0].length; newX++) {
      if (grid[y][newX] === "E") return false;
      if (grid[y][newX] === "F") return true;
    }
    return false;
  }

  function isDownAvailable(): boolean {
    for (let newY = y - 1; newY >= 0; newY--) {
      if (grid[newY][x] === "E") return false;
      if (grid[newY][x] === "F") return true;
    }
    return false;
  }

  function isLeftAvailable(): boolean {
    for (let newX = x - 1; newX >= 0; newX--) {
      if (grid[y][newX] === "E") return false;
      if (grid[y][newX] === "F") return true;
    }
    return false;
  }

  function isAvailable(): Availabilily {
    return {
      up: direction !== "down" && isUpAvailable(),
      right: direction !== "left" && isRightAvailable(),
      down: direction !== "up" && isDownAvailable(),
      left: direction !== "right" && isLeftAvailable(),
    };
  }

  function availableDirectionCount(available: Availabilily) {
    return +available.up + +available.right + +available.down + +available.left;
  }

  function directionToCommand(
    to: Direction
  ): "forward" | "turnLeft" | "turnRight" {
    return to === direction
      ? "forward"
      : (["turnRight", "turnLeft"] as const)[+(turnL[direction] === to)];
  }

  function getNextCommand(): [
    pop: boolean,
    command: "forward" | "turnRight" | "turnLeft" | "pop"
  ] {
    const available = isAvailable();
    const count = availableDirectionCount(available);
    const push = count > 1;

    if (!count) {
      return [false, "pop"];
    } else if (preferredDirection.type === "absolute") {
      for (const direction of preferredDirection.directions) {
        if (available[direction]) {
          return [push, directionToCommand(direction)];
        }
      }
    } else {
      for (const command of preferredDirection.commands) {
        if (
          (command === "forward" && available[direction]) ||
          (command === "turnLeft" && available[turnL[direction]]) ||
          (command === "turnRight" && available[turnR[direction]])
        ) {
          return [push, command];
        }
      }
    }
    throw new Error("Unreachable");
  }

  function move(command: "forward" | "turnRight" | "turnLeft") {
    const newDirection =
      command === "forward"
        ? direction
        : [turnL, turnR][+(command === "turnRight")][direction];
    direction = newDirection;
    let delta = coord[direction];
    while (grid[y][x] !== "F") {
      x += delta[0];
      y += delta[1];
    }
  }

  function pop() {
    const popped = useQueueInsteadOfStack ? backStack.shift() : backStack.pop();
    if (!popped) return;
    [x, y] = popped.coord;
    direction = popped.direction;
    if (!availableDirectionCount(isAvailable())) {
      commands.splice(commands.indexOf(popped.removeHandle), 1);
      pop();
    }
  }

  function isEnd(): boolean {
    return (
      grid.findIndex((row) => row.findIndex((cell) => cell === "F") !== -1) ===
      -1
    );
  }

  const commands: Record<"command", Command>[] = [];
  const backStack: BackStackElement[] = [];

  grid[y][x] = "P";
  while (!isEnd()) {
    const [push, command] = getNextCommand();
    if (push) {
      const toPush: Record<"command", Command> = { command: "push" };
      backStack.push({ coord: [x, y], direction, removeHandle: toPush });
      commands.push(toPush);
    }
    if (command === "pop") {
      commands.push({ command: "pop" });
      pop();
    } else {
      move(command);
      grid[y][x] = "P";
      commands.push({ command });
    }
  }

  backStack.forEach(({ removeHandle }) => {
    commands.splice(commands.indexOf(removeHandle), 1);
  });

  return commands.map(({ command }) => command);
}
