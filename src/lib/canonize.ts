import { Coord } from "./Coord";

export function canonize(normalizedPolyomino: Coord[]): Coord[] {
  return normalizedPolyomino.sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
}
