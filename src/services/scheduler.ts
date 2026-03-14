import { sleep } from "../utils/time.js";

export async function waitNextLoop(seconds: number) {
  await sleep(seconds * 1000);
}
