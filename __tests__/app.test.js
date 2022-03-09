// @ts-check

import {
  describe, beforeAll, it, expect,
} from '@jest/globals';

import fastify from 'fastify';
import init from '../server/plugin.js';

describe('requests', () => {
  let app;

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: true } });
    process.env.SESSION_KEY = '1A7234753778214125442A472D4A614E645267556B58703273357638792F765F';
    await init(app);
  });

  it('GET 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('GET 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
