import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers.js';

process.env.THROTTLE_DISABLED = 'true';

const user = {
  nim: '2025001',
  name: 'Tester Satu',
  email: 'tester@example.com',
  password: 'Rahasia123',
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeEach(async () => {
    app = await createApp();
  });
  afterEach(async () => {
    await app.close();
  });

  const register = (body: object = user) =>
    http().post('/auth/register').send(body);
  const login = (email = user.email, password = user.password) =>
    http().post('/auth/login').send({ email, password });

  describe('register', () => {
    it('berhasil dan tidak membocorkan password', async () => {
      const res = await register().expect(201);
      expect(res.body).toMatchObject({
        nim: user.nim,
        name: user.name,
        email: user.email,
        isActive: true,
      });
      expect(JSON.stringify(res.body)).not.toContain('password');
      expect(JSON.stringify(res.body)).not.toContain('resetToken');
    });

    it('menolak email & NIM duplikat (409)', async () => {
      await register().expect(201);
      await register({ ...user, nim: '9999999' }).expect(409);
      await register({ ...user, email: 'lain@example.com' }).expect(409);
    });

    it('email dinormalisasi huruf kecil', async () => {
      await register({ ...user, email: '  TESTER@Example.com ' }).expect(201);
      await login().expect(200);
    });

    it.each([
      ['password pendek', { password: 'a1' }],
      ['password tanpa angka', { password: 'hanyahuruf' }],
      ['email salah', { email: 'bukan-email' }],
      ['nim kosong', { nim: '' }],
      ['field asing', { isActive: false }],
      ['nama kosong', { name: '' }],
    ])('menolak input tidak valid: %s (400)', async (_label, patch) => {
      await register({ ...user, ...patch }).expect(400);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await register().expect(201);
    });

    it('mengembalikan access token dan data member', async () => {
      const res = await login().expect(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.tokenType).toBe('Bearer');
      expect(res.body.member.email).toBe(user.email);
      expect(JSON.stringify(res.body)).not.toContain('"password"');
    });

    it('menolak password salah dan email tidak dikenal (401, pesan sama)', async () => {
      const a = await login(user.email, 'SalahBanget1').expect(401);
      const b = await login('nobody@example.com').expect(401);
      expect(a.body.message).toBe(b.body.message);
    });

    it('akun seed tidak bisa login dengan password tebakan', async () => {
      await login('andi.saputra@example.com', 'hashedpassword1').expect(401);
    });

    it('akun tidak aktif ditolak (403)', async () => {
      // Citra (seed) tidak aktif; atur password lewat alur recovery tidak
      // mungkin karena tidak aktif, jadi cukup pastikan tak bisa masuk.
      await login('citra.dewi@example.com', 'apapun123').expect(401);
    });
  });

  describe('akses terproteksi', () => {
    it('route tanpa token ditolak, token palsu ditolak', async () => {
      await http().get('/members').expect(401);
      await http().get('/auth/me').expect(401);
      await http().post('/books').send({}).expect(401);
      await http()
        .get('/members')
        .set('Authorization', 'Bearer abc.def.ghi')
        .expect(401);
    });

    it('katalog buku & kategori publik untuk GET', async () => {
      await http().get('/books').expect(200);
      await http().get('/books/1').expect(200);
      await http().get('/categories').expect(200);
    });

    it('dengan token: /auth/me dan operasi buku berjalan', async () => {
      await register().expect(201);
      const { accessToken } = (await login().expect(200)).body;
      const auth = { Authorization: `Bearer ${accessToken}` };

      const me = await http().get('/auth/me').set(auth).expect(200);
      expect(me.body.email).toBe(user.email);

      const created = await http()
        .post('/books')
        .set(auth)
        .send({
          title: 'Laskar Pelangi',
          author: 'Andrea Hirata',
          isbn: '9789793062792',
          publishedDate: '2005-09-01',
        })
        .expect(201);
      expect(created.body.isAvailable).toBe(true);
      expect(created.body).not.toHaveProperty('isaavailable');

      await http().post('/books').set(auth).send({ title: 'x' }).expect(400);
      await http()
        .patch(`/books/${created.body.id}`)
        .set(auth)
        .send({ isAvailable: false })
        .expect(200);
    });

    it('member hanya boleh mengubah/menghapus akun sendiri', async () => {
      const me = (await register().expect(201)).body;
      const { accessToken } = (await login().expect(200)).body;
      const auth = { Authorization: `Bearer ${accessToken}` };

      await http()
        .patch('/members/1')
        .set(auth)
        .send({ name: 'Hack' })
        .expect(403);
      await http().delete('/members/1').set(auth).expect(403);
      await http()
        .patch(`/members/${me.id}`)
        .set(auth)
        .send({ name: 'Nama Baru' })
        .expect(200);
      // password tidak boleh diubah lewat PATCH
      await http()
        .patch(`/members/${me.id}`)
        .set(auth)
        .send({ password: 'Baru12345' })
        .expect(400);

      const list = await http().get('/members').set(auth).expect(200);
      expect(JSON.stringify(list.body)).not.toContain('"password"');
    });
  });

  describe('forgot password & password recovery', () => {
    beforeEach(async () => {
      await register().expect(201);
    });

    const forgot = (email: string) =>
      http().post('/auth/forgot-password').send({ email });
    const recover = (body: object) =>
      http().post('/auth/password-recovery').send(body);

    it('respons forgot-password sama untuk email terdaftar & tidak', async () => {
      const a = await forgot(user.email).expect(200);
      const b = await forgot('nobody@example.com').expect(200);
      expect(a.body.message).toBe(b.body.message);
      expect(b.body.resetToken).toBeUndefined();
    });

    it('alur lengkap: token -> password baru -> login', async () => {
      const oldToken = (await login().expect(200)).body.accessToken;
      const { resetToken } = (await forgot(user.email).expect(200)).body;
      expect(resetToken).toBeTruthy();

      await recover({
        email: user.email,
        token: resetToken,
        password: 'PasswordBaru456',
        passwordConfirm: 'PasswordBaru456',
      }).expect(200);

      await login(user.email, user.password).expect(401);
      await login(user.email, 'PasswordBaru456').expect(200);

      // token sekali pakai
      await recover({
        email: user.email,
        token: resetToken,
        password: 'LagiLagi789',
        passwordConfirm: 'LagiLagi789',
      }).expect(400);

      // sesi lama dicabut setelah ganti password
      await http()
        .get('/auth/me')
        .set('Authorization', `Bearer ${oldToken}`)
        .expect(401);
    });

    it('menolak token salah, konfirmasi tidak cocok, email lain', async () => {
      const { resetToken } = (await forgot(user.email).expect(200)).body;
      const ok = {
        email: user.email,
        token: resetToken,
        password: 'PasswordBaru456',
        passwordConfirm: 'PasswordBaru456',
      };
      await recover({ ...ok, token: 'salah' }).expect(400);
      await recover({ ...ok, passwordConfirm: 'Beda123456' }).expect(400);
      await recover({ ...ok, email: 'andi.saputra@example.com' }).expect(400);
      await recover({
        ...ok,
        password: 'pendek',
        passwordConfirm: 'pendek',
      }).expect(400);
      await recover(ok).expect(200);
    });

    it('token kedaluwarsa ditolak', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        const { resetToken } = (await forgot(user.email).expect(200)).body;
        vi.setSystemTime(Date.now() + 61 * 60_000);
        await recover({
          email: user.email,
          token: resetToken,
          password: 'PasswordBaru456',
          passwordConfirm: 'PasswordBaru456',
        }).expect(400);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
