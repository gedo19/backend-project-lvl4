// @ts-check

import fastify from 'fastify';

import init from '../server/plugin.js';
import { authorize, getTestData, prepareData } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const { name } = testData.labels.existing;
    const { id } = await models.taskLabel.query().findOne({ name });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editLabel', { id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const labelData = testData.labels.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('postLabel'),
      payload: {
        data: labelData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    await expect(models.taskLabel.query().findOne({ name: labelData.name }))
      .resolves
      .toMatchObject(labelData);
  });

  it('patch', async () => {
    const {
      existing: labelData,
      editing: newLabelData,
    } = testData.labels;
    const { id } = await models.taskLabel.query().findOne({ name: labelData.name });

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id }),
      payload: {
        data: newLabelData,
      },
      cookies: cookie,
    });

    expect(responseUpdate.statusCode).toBe(302);
    await expect(models.taskLabel.query().findById(id))
      .resolves
      .toMatchObject(newLabelData);
  });

  it('delete', async () => {
    const { name } = testData.labels.existing;
    const { id } = await models.taskLabel.query().findOne({ name });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    await expect(models.taskLabel.query().findById(id))
      .resolves
      .toBeFalsy();
  });

  afterEach(async () => {
    knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
