import { Command } from "./Command";

export function commandsToBits(commands: Command[]): string {
  let bits = "";

  for (const command of commands) {
    switch (command) {
      case "forward":
        bits += "11";
        break;
      case "turnRight":
        bits += "10";
        break;
      case "turnLeft":
        bits += "01";
        break;
      case "push":
        bits += "001";
        break;
      case "pop":
        bits += "000";
        break;
    }
  }
  return bits;
}
