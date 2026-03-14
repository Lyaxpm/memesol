import { printBanner } from "./cli/banner.js";
import { printStartupStatus } from "./cli/statusView.js";
import { createLogger } from "./cli/logger.js";
import { loadEnv } from "./config/env.js";
import { initDb } from "./db/sqlite.js";
import { runMigrations } from "./db/migrations.js";
import { MemoryRepo } from "./db/repositories/memoryRepo.js";
import { createLlmProvider } from "./llm/provider.js";
import { AgentMemory } from "./agent/memory.js";
import { AgentRuntime } from "./agent/runtime.js";
import { PaperBroker } from "./execution/paperBroker.js";
import { LiveBroker } from "./execution/liveBroker.js";
import { runHealthChecks } from "./risk/healthChecks.js";
import { printBlock } from "./cli/blocks.js";
import { runLoop } from "./services/orchestrator.js";
import { waitNextLoop } from "./services/scheduler.js";

async function main() {
  printBanner();
  const env = loadEnv();
  const logger = createLogger(env);
  printStartupStatus(env);

  const db = initDb();
  runMigrations(db);
  const repo = new MemoryRepo(db);

  const checks = await runHealthChecks(env);
  printBlock("STARTUP HEALTH", checks.map((c) => `${c.name}: ${c.ok ? "OK" : "FAIL"} (${c.detail})`));

  const provider = createLlmProvider(env);
  const memory = new AgentMemory(repo);
  const runtime = new AgentRuntime(provider, memory);
  const broker = env.LIVE_TRADING ? new LiveBroker(env) : new PaperBroker(env.TOTAL_CAPITAL_USD);

  let shuttingDown = false;
  const stop = () => {
    shuttingDown = true;
    logger.info("Graceful shutdown requested");
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  while (!shuttingDown) {
    try {
      await runLoop(env, runtime, broker, repo);
    } catch (e) {
      logger.error({ err: e }, "loop failed");
    }
    await waitNextLoop(env.SCAN_INTERVAL_SECONDS);
  }

  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
