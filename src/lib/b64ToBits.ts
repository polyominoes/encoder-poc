const map: Partial<Record<string, number>> = {
  q: 0,
  w: 1,
  e: 2,
  r: 3,
  t: 4,
  y: 5,
  u: 6,
  i: 7,
  o: 8,
  p: 9,
  a: 10,
  s: 11,
  d: 12,
  f: 13,
  g: 14,
  h: 15,
  j: 16,
  k: 17,
  l: 18,
  z: 19,
  x: 20,
  c: 21,
  v: 22,
  b: 23,
  n: 24,
  m: 25,
  Q: 26,
  W: 27,
  E: 28,
  R: 29,
  T: 30,
  Y: 31,
  U: 32,
  I: 33,
  O: 34,
  P: 35,
  A: 36,
  S: 37,
  D: 38,
  F: 39,
  G: 40,
  H: 41,
  J: 42,
  K: 43,
  L: 44,
  Z: 45,
  X: 46,
  C: 47,
  V: 48,
  B: 49,
  N: 50,
  M: 51,
  "1": 52,
  "2": 53,
  "3": 54,
  "4": 55,
  "5": 56,
  "6": 57,
  "7": 58,
  "8": 59,
  "9": 60,
  "0": 61,
  "-": 62,
  _: 63,
};

export function b64ToBits(b64: string): string {
  let bits = "";

  for (const digit of b64) {
    const part = map[digit];
    if (part === undefined) {
      throw new Error("Invalid digit");
    }
    bits += part.toString(2).padStart(6, "0");
  }

  return bits;
}
