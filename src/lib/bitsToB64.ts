const map = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_";

export function bitsToB64(bits: string): string {
  let result = "";
  let i = 0;
  while (i < bits.length) {
    let currentBits = bits.slice(i, i + 6);
    if (currentBits.length < 6) {
      currentBits += "0".repeat(6 - currentBits.length);
    }
    result += map[parseInt(currentBits, 2)];
    i += 6;
  }
  return result;
}
