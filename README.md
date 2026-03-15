# MemeSol Agent (CLI)

AI-first autonomous Solana meme-coin trading agent for terminal execution.

## Important
This is **an AI agent runtime**, not only a deterministic rule bot:
- Agent decides opportunities and action (BUY/SELL/HOLD/SKIP).
- Risk engine enforces hard safety constraints.
- Broker executes only if guardrails allow.

## Architecture
1. Discovery layer (`src/discovery`, `src/collectors`)
2. Analytics/scoring layer (`src/scoring`)
3. AI agent decision layer (`src/agent`, `src/llm`)
4. Risk + execution layer (`src/risk`, `src/execution`)

Agent cycle: observe → analyze → decide → validate → act → reflect.

## AgentRouter integration
Configured via env:
- `AGENT_ROUTER_TOKEN`
- `AGENTROUTER_BASE_URL` (default `https://agentrouter.org/v1`)
- `AGENT_MODEL` (default `gpt-5`)

LLM integration uses provider abstraction:
- `src/llm/types.ts`
- `src/llm/provider.ts`
- `src/llm/agentRouterClient.ts`

Structured response parsing/validation:
- `src/llm/parser.ts` (zod schema)
- Invalid model output falls back to safe `SKIP`.


## Run
```bash
npm install
cp .env.example .env
npm run start
```

`npm run start` performs startup banner, env validation, DB bootstrap, health checks, then starts continuous autonomous loops.

## Paper vs Live
- Default: `PAPER_TRADING=true`, `LIVE_TRADING=false`
- Live mode requires `BOT_PRIVATE_KEY` and explicit `LIVE_TRADING=true`
- `LiveBroker` is fail-safe and refuses to run without explicit live mode

## Guardrails
- Kill switch
- max daily loss
- max position size
- max open positions
- confidence threshold
- reserve SOL minimum
- balance checks
- fail-closed behavior

## CLI Output
The terminal shows structured blocks:
- startup health
- token/wallet scores
- AI decision summary
- risk allow/deny reasons
- execution result
- reflection summary

No chain-of-thought is printed; only concise decision reasons.

## Limitations & risk
- External APIs are adapterized with safe placeholders for paper-mode bootability.
- Live routing/execution adapter should be completed and audited before real funds.
- Meme-coin markets are highly risky; many loops should SKIP by design with $10 capital.
