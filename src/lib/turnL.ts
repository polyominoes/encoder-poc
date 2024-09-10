import { Direction } from "./Direction";

export const turnL: Record<Direction, Direction> = {
  up: "left",
  left: "down",
  down: "right",
  right: "up",
};
