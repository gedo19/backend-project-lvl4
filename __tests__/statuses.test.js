// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    await knex.migrate.latest();
    await prepareData(app);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  beforeEach(async () => {
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('postStatus'),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const taskStatus = await models.taskStatus.query().findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('editing / deleting', async () => {
    const responseEditForm = await app.inject({
      method: 'GET',
      url: app.reverse('editStatus', { id: 1 }),
      cookies: cookie,
    });

    expect(responseEditForm.statusCode).toBe(200);

    const params = testData.statuses.editing;

    const responseEdit = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id: 1 }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseEdit.statusCode).toBe(302);

    const taskStatus = await models.taskStatus.query().findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: 1 }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);

    // TODO: сделать тесты без аутентификации и авторизации
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
