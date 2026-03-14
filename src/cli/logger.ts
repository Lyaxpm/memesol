import pino from "pino";
import type { Env } from "../config/env.js";

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    transport:
      env.LOG_FORMAT === "pretty"
        ? {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
          }
        : undefined
  });
}
