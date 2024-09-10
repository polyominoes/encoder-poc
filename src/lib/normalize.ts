import { Coord } from "./Coord";

export function normalize(polyomino: Coord[]): Coord[] {
  const minX = Math.min(...polyomino.map((coord) => coord[0]));
  const minY = Math.min(...polyomino.map((coord) => coord[1]));
  return polyomino.map(([x, y]) => [x - minX, y - minY]);
}
