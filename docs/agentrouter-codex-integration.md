# Integrasi AgentRouter untuk Codex (MemeSol)

Dokumen ini menjelaskan langkah praktis untuk menghubungkan runtime agent MemeSol ke AgentRouter supaya keputusan AI tidak selalu fallback ke `SKIP`.

## 1) Siapkan token AgentRouter

1. Buat token AgentRouter.
2. Simpan token tersebut untuk dimasukkan ke environment variable `AGENT_ROUTER_TOKEN`.

Jika token salah/expired, runtime akan fallback aman dengan warning:
> `AgentRouter authentication failed`.

## 2) Konfigurasi environment

```bash
cp .env.example .env
```

Minimum konfigurasi AgentRouter:

```env
AGENT_ROUTER_TOKEN=<isi_token_valid>
AGENTROUTER_BASE_URL=https://agentrouter.org/v1
AGENT_MODEL=deepseek-v3.2
```

Catatan:
- `AGENTROUTER_BASE_URL` default mengarah ke endpoint OpenAI-compatible AgentRouter.
- `AGENT_MODEL` dapat diganti jika ingin model lain yang kompatibel.

## 3) Jalankan agent CLI

```bash
npm install
npm run start
```

Perhatikan baris health check `agentrouter`:
- `configured, reachable, response shape valid` jika token + endpoint valid.
- fallback aman jika token tidak ada atau endpoint tidak dapat diakses.

## 4) Troubleshooting singkat

Jika keputusan sering `SKIP` dengan warning provider:
1. Pastikan `AGENT_ROUTER_TOKEN` benar dan aktif.
2. Verifikasi `AGENTROUTER_BASE_URL` tidak typo.
3. Cek konektivitas jaringan dari host.
4. Gunakan `LOG_LEVEL=debug` untuk melihat preview respons provider yang disanitasi.

## 5) Referensi kode

- `src/config/env.ts` → definisi env AgentRouter.
- `src/llm/provider.ts` → pemilihan provider AgentRouter.
- `src/llm/agentRouterClient.ts` → HTTP client OpenAI-compatible + defensive parsing.
