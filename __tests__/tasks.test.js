// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { authorize, getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
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
      url: app.reverse('tasks#index'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('task', async () => {
    const taskData = testData.tasks.existing;
    const { id } = await models.task.query().findOne({ name: taskData.name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#show', { id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#new'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const { name } = testData.tasks.existing;
    const { id } = await models.task.query().findOne({ name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#edit', { id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const taskData = testData.tasks.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks#create'),
      payload: {
        data: taskData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    await expect(models.task.query().findOne({ name: taskData.name }))
      .resolves
      .toMatchObject(taskData);
  });

  it('patch', async () => {
    const {
      existing: taskData,
      editing: newTaskData,
    } = testData.tasks;
    const { id } = await models.task.query().findOne({ name: taskData.name });

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('tasks#update', { id }),
      payload: {
        data: newTaskData,
      },
      cookies: cookie,
    });

    expect(responseUpdate.statusCode).toBe(302);
    await expect(models.task.query().findById(id))
      .resolves
      .toMatchObject(newTaskData);
  });

  it('delete', async () => {
    const { name } = testData.tasks.existing;
    const { id } = await models.task.query().findOne({ name });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('tasks#destroy', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    await expect(models.task.query().findById(id))
      .resolves
      .toBeFalsy();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
