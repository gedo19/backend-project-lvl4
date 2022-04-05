// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { authorize, getTestData, prepareData } from './helpers/index.js';

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
  });

  beforeEach(async () => {
    await prepareData(app);
    cookie = await authorize(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#index'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#new'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const { name } = testData.statuses.existing;
    const { id } = await models.taskStatus.query().findOne({ name });

    const responseEditForm = await app.inject({
      method: 'GET',
      url: app.reverse('statuses#edit', { id }),
      cookies: cookie,
    });

    expect(responseEditForm.statusCode).toBe(200);
  });

  it('create', async () => {
    const statusData = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses#create'),
      payload: {
        data: statusData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    await expect(models.taskStatus.query().findOne({ name: statusData.name }))
      .resolves
      .toMatchObject(statusData);
  });

  it('patch', async () => {
    const {
      existing: statusData,
      editing: newStatusData,
    } = testData.statuses;
    const { id } = await models.taskStatus.query().findOne({ name: statusData.name });

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('statuses#update', { id }),
      payload: {
        data: newStatusData,
      },
      cookies: cookie,
    });

    expect(responseUpdate.statusCode).toBe(302);
    await expect(models.taskStatus.query().findById(id))
      .resolves
      .toMatchObject(newStatusData);
  });

  it('delete', async () => {
    const { name } = testData.statuses.existing;
    const { id } = await models.taskStatus.query().findOne({ name });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('statuses#destroy', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    await expect(models.taskStatus.query().findById(id))
      .resolves
      .toBeFalsy();
  });

  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
