import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers.js';

describe('Rate limit login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.THROTTLE_DISABLED = 'false';
    app = await createApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('memblokir percobaan login berulang (429)', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@example.com', password: 'Salah12345' });
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 401)).toBe(true);
    expect(statuses[11]).toBe(429);
  });
});
