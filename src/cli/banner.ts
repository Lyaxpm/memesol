import chalk from "chalk";
import { APP_NAME } from "../config/constants.js";

export function printBanner() {
  console.log(chalk.cyan.bold(`\n=== ${APP_NAME} ===`));
  console.log(chalk.gray("Autonomous Solana meme-coin AI trading agent (CLI-only)\n"));
}
