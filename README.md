# API Perpustakaan (NestJS)

API buku, kategori, dan member dengan autentikasi JWT.

## Menjalankan

```bash
npm install
cp .env.example .env     # isi JWT_SECRET
npm run build && npm run start:prod   # atau: npm run start:dev
npm test && npm run test:e2e
```

## Halaman form (UI)

Setelah server jalan, buka di browser (folder `public/`, disajikan oleh server yang sama):

| URL | Isi |
|---|---|
| `/login` | Form Login (email, password) |
| `/register` | Form Register Member (NIM, nama, email, password) |
| `/forgot-password` | Form Forgot Password (email) |
| `/password-recovery` | Form Password Recovery (email, token, password, konfirmasi) |
| `/dashboard` | Profil member + daftar buku (wajib login) |

Di mode development, setelah "Kirim" di Forgot Password muncul link langsung ke halaman recovery (karena email belum dikirim).

## Endpoint Auth (modul `auth`)

| Endpoint | Body | Keterangan |
|---|---|---|
| `POST /auth/register` | `nim, name, email, password` | Daftar member baru (201) |
| `POST /auth/login` | `email, password` | Mengembalikan `accessToken` (JWT) |
| `POST /auth/forgot-password` | `email` | Membuat token reset; respons selalu sama |
| `POST /auth/password-recovery` | `email, token, password, passwordConfirm` | Ganti password pakai token dari email |
| `GET /auth/me` | – | Profil member yang login |

Kirim token di header: `Authorization: Bearer <accessToken>`.

Aturan password: 8–72 karakter, mengandung huruf dan angka.

## Hak akses

- Publik: halaman form di atas, `GET /books`, `GET /books`, `GET /books/:id`, `GET /categories`, `GET /categories/:id`, dan 4 endpoint POST auth di atas.
- Wajib login: selebihnya (tambah/ubah/hapus buku & kategori, `/members`).
- Member hanya bisa mengubah/menghapus akunnya sendiri.

## Catatan sebelum produksi

1. **Data masih in-memory** (hilang saat restart). Ganti service dengan database sungguhan (TypeORM/Prisma).
2. **Email belum terkirim**: `src/auth/mail.service.ts` hanya mencetak token ke log (non-production). Isi `sendPasswordReset` dengan SMTP/layanan email. Di production token tidak pernah dikembalikan di respons maupun log.
3. Set `JWT_SECRET` (server menolak start di production tanpa itu).
4. Akun seed (Andi, Budi, Citra) tidak punya password yang diketahui; pemiliknya harus memakai *forgot password*.
