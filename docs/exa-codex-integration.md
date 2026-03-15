# Integrasi Exa untuk Codex (MemeSol)

Dokumen ini menjelaskan langkah praktis untuk menghubungkan runtime agent MemeSol ke Exa supaya keputusan AI tidak selalu fallback ke `SKIP`.

## 1) Siapkan API key Exa

1. Buka dashboard Exa dan buat API key.
2. Simpan token tersebut untuk dimasukkan ke environment variable `EXA_API_KEY`.

Jika token tidak valid atau tidak diisi, agent akan fallback ke mode observasi dengan warning:
> `Exa authentication failed`.

## 2) Isi file `.env`

Salin file contoh env lalu isi nilainya:

```bash
cp .env.example .env
```

Minimum konfigurasi Exa:

```env
EXA_API_KEY=<isi_token_valid>
EXA_BASE_URL=https://api.exa.ai
EXA_MODEL=exa
EXA_SEARCH_TYPE=auto
```

Catatan:
- `EXA_BASE_URL` default mengarah ke endpoint publik Exa.
- `EXA_SEARCH_TYPE=auto` direkomendasikan untuk keseimbangan kecepatan dan relevansi.

## 3) Jalankan dan validasi startup

```bash
npm run start
```

Pada startup, agent akan memuat env dan menjalankan health check sebelum loop trading dimulai.
Perhatikan baris health check `exa`:
- `configured` jika `EXA_API_KEY` terisi.
- `fallback mode` jika key kosong.

## 4) Verifikasi perilaku fallback

Jika API key invalid:
- Keputusan akan cenderung `SKIP`.
- Reason/warning mengandung `Exa authentication failed`.

Jika API key valid:
- Respons model berisi keputusan valid (`BUY` / `SELL` / `HOLD` / `SKIP`) dengan confidence normal sesuai kondisi pasar.

## 5) Troubleshooting singkat

1. Pastikan `EXA_API_KEY` benar dan aktif.
2. Verifikasi `EXA_BASE_URL` tidak typo.
3. Cek koneksi outbound dari environment runtime.
4. Jika timeout, naikkan `SCAN_INTERVAL_SECONDS` supaya loop tidak terlalu rapat.
5. Coba ubah `EXA_SEARCH_TYPE` ke `deep` bila perlu riset lebih mendalam.

## 6) Lokasi kode terkait

- `src/config/env.ts` → definisi env Exa.
- `src/llm/provider.ts` → pemilihan provider Exa.
- `src/llm/exaClient.ts` → HTTP client ke endpoint Exa.
- `src/llm/parser.ts` → parser output keputusan agent.
