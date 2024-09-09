import { Coord } from "./Coord";

type CellState = "empty" | "filled" | "processed";

function toGrid(normalizedPolyomino: Coord[]): CellState[][] {
  const height = Math.max(...normalizedPolyomino.map(([_, y]) => y)) + 1;
  const width = Math.max(...normalizedPolyomino.map(([x]) => x)) + 1;
  const result: CellState[][] = Array.from(new Array(height)).map(() =>
    Array.from(new Array(width)).map(() => "empty")
  );
  normalizedPolyomino.forEach(([x, y]) => (result[y][x] = "filled"));
  return result;
}

type Direction = "up" | "right" | "down" | "left";
type Command = "forward" | "turnRight" | "turnLeft" | "push" | "pop";

interface BackStackElement {
  removeHandle: Record<"command", Command>;
  direction: Direction;
  coord: Coord;
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

export interface EncodeConfig {
  useQueueInsteadOfStack: boolean;
  relative: boolean;
  ccw: boolean;
  firstDirection: Direction;
  startDirection: Direction;
  startRight: boolean;
}

export const encodeConfigDefault = {
  useQueueInsteadOfStack: false,
  relative: false,
  ccw: false,
  firstDirection: "up",
  startDirection: "left",
  startRight: false,
} as const satisfies EncodeConfig;

export function encodeWithConfig(
  normalizedPolyomino: Coord[],
  {
    useQueueInsteadOfStack,
    relative,
    ccw,
    firstDirection,
    startDirection,
    startRight,
  }: EncodeConfig = encodeConfigDefault
): Uint8Array {
  let direction = startRight ? turnL[startDirection] : turnR[startDirection];

  function directionToCommand(
    to: Direction
  ): "forward" | "turnLeft" | "turnRight" {
    return to === direction
      ? "forward"
      : (["turnRight", "turnLeft"] as const)[+(turnL[direction] === to)];
  }

  function nextDirection(
    filled: Record<Direction, boolean>
  ): [push: boolean, command: Exclude<Command, "push">] {
    const count = [
      filled.up && direction !== "down",
      filled.right && direction !== "left",
      filled.down && direction !== "up",
      filled.left && direction !== "right",
    ].reduce((acc, curr) => acc + +curr, 0);
    if (!count) {
      return [false, "pop"];
    }
    const push = count > 1;
    if (relative) {
      if (ccw) {
        if (filled[direction]) {
          return [push, "forward"];
        } else if (filled[turnL[direction]]) {
          return [push, "turnLeft"];
        } else {
          return [push, "turnRight"];
        }
      } else {
        if (filled[direction]) {
          return [push, "forward"];
        } else if (filled[turnR[direction]]) {
          return [push, "turnRight"];
        } else {
          return [push, "turnLeft"];
        }
      }
    } else {
      if (ccw) {
        if (
          filled[firstDirection] &&
          firstDirection !== turnL[turnL[direction]]
        ) {
          return [push, directionToCommand(firstDirection)];
        } else if (
          filled[turnL[firstDirection]] &&
          firstDirection !== turnL[direction]
        ) {
          return [push, directionToCommand(turnL[firstDirection])];
        } else if (
          filled[turnL[turnL[firstDirection]]] &&
          firstDirection !== direction
        ) {
          return [push, directionToCommand(turnL[turnL[firstDirection]])];
        } else {
          return [push, directionToCommand(turnR[firstDirection])];
        }
      } else {
        if (
          filled[firstDirection] &&
          firstDirection !== turnL[turnL[direction]]
        ) {
          return [push, directionToCommand(firstDirection)];
        } else if (
          filled[turnR[firstDirection]] &&
          firstDirection !== turnR[direction]
        ) {
          return [push, directionToCommand(turnR[firstDirection])];
        } else if (
          filled[turnR[turnR[firstDirection]]] &&
          firstDirection !== direction
        ) {
          return [push, directionToCommand(turnR[turnR[firstDirection]])];
        } else {
          return [push, directionToCommand(turnL[firstDirection])];
        }
      }
    }
  }

  const grid = toGrid(normalizedPolyomino);
  let [x, y] = (function getStartingPoint(): Coord {
    if (startDirection === "left" && !startRight) {
      return [0, grid.findIndex(([cell]) => cell === "filled")];
    } else if (startDirection === "left" && startRight) {
      return [
        0,
        grid.reduce((acc, [cell], i) => (cell === "filled" ? i : acc), NaN),
      ];
    } else if (startDirection === "up" && !startRight) {
      return [grid[grid.length - 1].indexOf("filled"), grid.length - 1];
    } else if (startDirection === "up" && startRight) {
      return [grid[grid.length - 1].lastIndexOf("filled"), grid.length - 1];
    } else if (startDirection === "right" && !startRight) {
      return [
        grid[0].length - 1,
        grid.reduce(
          (acc, curr, i) => (curr[curr.length - 1] === "filled" ? i : acc),
          NaN
        ),
      ];
    } else if (startDirection === "right" && startRight) {
      return [
        grid[0].length - 1,
        grid.findIndex((row) => row[row.length - 1] === "filled"),
      ];
    } else if (startDirection === "down" && !startRight) {
      return [grid[0].lastIndexOf("filled"), 0];
    } else {
      return [grid[0].indexOf("filled"), 0];
    }
  })();

  function isUpFilled(): boolean {
    for (let newY = y + 1; newY < grid.length; newY++) {
      if (grid[newY][x] === "empty") return false;
      if (grid[newY][x] === "filled") return true;
    }
    return false;
  }

  function isRightFilled(): boolean {
    for (let newX = x + 1; newX < grid[0].length; newX++) {
      if (grid[y][newX] === "empty") return false;
      if (grid[y][newX] === "filled") return true;
    }
    return false;
  }

  function isDownFilled(): boolean {
    for (let newY = y - 1; newY >= 0; newY--) {
      if (grid[newY][x] === "empty") return false;
      if (grid[newY][x] === "filled") return true;
    }
    return false;
  }

  function isLeftFilled(): boolean {
    for (let newX = x - 1; newX >= 0; newX--) {
      if (grid[y][newX] === "empty") return false;
      if (grid[y][newX] === "filled") return true;
    }
    return false;
  }

  function isFilled(): Record<Direction, boolean> {
    return {
      up: isUpFilled(),
      right: isRightFilled(),
      down: isDownFilled(),
      left: isLeftFilled(),
    };
  }

  function isEnd(): boolean {
    return (
      grid.findIndex(
        (row) => row.findIndex((cell) => cell === "filled") !== -1
      ) === -1
    );
  }

  const commands: Record<"command", Command>[] = [];
  const backStack: BackStackElement[] = [];

  function isNoFilled(
    filled: Record<Direction, boolean> = isFilled()
  ): boolean {
    return !filled.up && !filled.right && !filled.down && !filled.left;
  }

  function pop() {
    const popped = useQueueInsteadOfStack ? backStack.shift() : backStack.pop();
    if (!popped) return;
    [x, y] = popped.coord;
    direction = popped.direction;
    if (isNoFilled()) {
      commands.splice(commands.indexOf(popped.removeHandle), 1);
      pop();
    }
  }

  function move(command: "forward" | "turnRight" | "turnLeft") {
    const newDirection =
      command === "forward"
        ? direction
        : [turnL, turnR][+(command === "turnRight")][direction];
    direction = newDirection;
    if (direction === "up") {
      for (let newY = y + 1; newY < grid.length; newY++) {
        if (grid[newY][x] === "filled") {
          y = newY;
          break;
        }
      }
    } else if (direction === "right") {
      for (let newX = x + 1; newX < grid[0].length; newX++) {
        if (grid[y][newX] === "filled") {
          x = newX;
          break;
        }
      }
      return false;
    } else if (direction === "down") {
      for (let newY = y - 1; y >= 0; y--) {
        if (grid[newY][x] === "filled") {
          y = newY;
          break;
        }
      }
    } else {
      for (let newX = x - 1; newX >= 0; newX++) {
        if (grid[y][newX] === "filled") {
          x = newX;
          break;
        }
      }
    }
  }

  grid[y][x] = "processed";
  while (!isEnd()) {
    const [push, command] = nextDirection(isFilled());
    if (push) {
      const toPush: Record<"command", Command> = { command: "push" };
      backStack.push({ coord: [x, y], direction, removeHandle: toPush });
      commands.push(toPush);
    }
    if (command === "pop") {
      pop();
      commands.push({ command: "pop" });
    } else {
      move(command);
      grid[y][x] = "processed";
      commands.push({ command });
    }
  }

  return commandsToBuffer(commands.map(({ command }) => command));
}

function commandsToBuffer(commands: Command[]): Uint8Array {
  let bits = "";

  for (const command of commands) {
    switch (command) {
      case "forward":
        bits += "00";
        break;
      case "turnRight":
        bits += "01";
        break;
      case "turnLeft":
        bits += "10";
        break;
      case "push":
        bits += "11";
        break;
      case "pop":
        bits += "1111";
        break;
    }
  }

  const paddingLength = (8 - (bits.length % 8)) % 8;
  bits += "1".repeat(paddingLength);

  const byteArray = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    byteArray.push(parseInt(byte, 2));
  }

  return new Uint8Array(byteArray);
}
