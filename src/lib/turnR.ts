import { Direction } from "./Direction";

export const turnR: Record<Direction, Direction> = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
};
