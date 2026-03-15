# Integrasi AgentRouter untuk Codex (MemeSol)

Dokumen ini menjelaskan langkah praktis untuk menghubungkan runtime agent MemeSol ke AgentRouter supaya keputusan AI tidak selalu fallback ke `SKIP`.

## 1) Siapkan token AgentRouter

1. Buka dashboard AgentRouter.
2. Buat/generate API token.
3. Simpan token tersebut untuk dimasukkan ke environment variable `AGENT_ROUTER_TOKEN` (utama). Alias kompatibilitas: `AGENTROUTER_API_KEY` atau `OPENAI_API_KEY`.

> Jika token kosong/salah, runtime akan masuk mode fallback dan keputusan AI akan terlihat seperti:
> `AgentRouter authentication failed`.

## 2) Atur environment variables

Salin file contoh env lalu isi nilainya:

```bash
cp .env.example .env
```

Minimum konfigurasi AgentRouter:

```env
AGENT_ROUTER_TOKEN=<isi_token_valid>
# Optional alias (pakai salah satu saja bila perlu):
# AGENTROUTER_API_KEY=<isi_token_valid>
# OPENAI_API_KEY=<isi_token_valid>
AGENTROUTER_BASE_URL=https://agentrouter.org/v1
AGENT_MODEL=gpt-5
```

Catatan:
- `AGENTROUTER_BASE_URL` default sudah mengarah ke endpoint publik AgentRouter.
- Gunakan model yang didukung akun/token Anda.

## 3) Jalankan agent

```bash
npm install
npm run start
```

Pada startup, agent akan memuat env dan menjalankan health check sebelum loop trading dimulai.

## 4) Verifikasi integrasi berhasil

Tanda integrasi **belum** berhasil:
- Log keputusan menunjukkan `SKIP` dengan confidence rendah.
- Reason/warning mengandung `AgentRouter authentication failed`.

Tanda integrasi **berhasil**:
- Tidak muncul reason autentikasi gagal.
- Respons model berisi keputusan valid (`BUY` / `SELL` / `HOLD` / `SKIP`) dengan confidence normal sesuai kondisi pasar.

## 5) Checklist troubleshooting cepat

1. Pastikan `.env` benar-benar terbaca saat `npm run start`.
2. Prioritas variabel token: `AGENT_ROUTER_TOKEN` → `AGENTROUTER_API_KEY` → `OPENAI_API_KEY`.
3. Verifikasi `AGENTROUTER_BASE_URL` tidak typo.
4. Pastikan token masih aktif / belum direvoke, dan tidak berisi prefix ganda seperti `Bearer Bearer ...`.
5. Coba ganti `AGENT_MODEL` ke model lain yang diizinkan oleh akun.

## 6) Lokasi implementasi di kode

Untuk audit/debug cepat:
- `src/config/env.ts` → validasi env & default URL.
- `src/llm/agentRouterClient.ts` → request ke `/chat/completions` + fallback ketika auth gagal.
- `src/llm/provider.ts` → pemilihan provider AgentRouter.
- `src/llm/parser.ts` → validasi output terstruktur model.

