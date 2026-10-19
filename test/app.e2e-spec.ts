import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers.js';

process.env.THROTTLE_DISABLED = 'true';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) public', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
