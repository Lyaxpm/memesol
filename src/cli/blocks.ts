import chalk from "chalk";

export function printBlock(title: string, lines: string[]) {
  console.log(chalk.yellow(`\n[${title}]`));
  for (const l of lines) console.log(`- ${l}`);
}
