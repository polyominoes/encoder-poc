import { Command } from "./Command.";

export function bitsToCommands(bits: string): Command[] {
  const commands: Command[] = [];
  let i = 0;

  while (i < bits.length) {
    if (bits.slice(i, i + 3) === "001") {
      commands.push("push");
      i += 3;
    } else if (bits.slice(i, i + 2) === "11") {
      commands.push("forward");
      i += 2;
    } else if (bits.slice(i, i + 2) === "01") {
      commands.push("turnLeft");
      i += 2;
    } else if (bits.slice(i, i + 1) === "1") {
      commands.push("turnRight");
      i += 2;
    } else {
      commands.push("pop");
      i += 3;
    }
  }

  return commands;
}
