// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { authorize, getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
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
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit', async () => {
    const userData = testData.users.existing;
    const cookie = await authorize(app, userData);
    const { id } = await models.user.query().findOne({ email: userData.email });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const userData = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('postUser'),
      payload: {
        data: userData,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(userData, 'password'),
      passwordDigest: encrypt(userData.password),
    };

    await expect(models.user.query().findOne({ email: userData.email }))
      .resolves
      .toMatchObject(expected);
  });

  it('patch', async () => {
    const {
      existing: userData,
      editing: newUserData,
    } = testData.users;

    const cookie = await authorize(app, userData);
    const { id } = await models.user.query().findOne({ email: userData.email });

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id }),
      payload: {
        data: newUserData,
      },
      cookies: cookie,
    });

    expect(responseUpdate.statusCode).toBe(302);

    const expected = {
      ..._.omit(newUserData, 'password'),
      passwordDigest: encrypt(newUserData.password),
    };

    await expect(models.user.query().findById(id))
      .resolves
      .toMatchObject(expected);
  });

  it('delete', async () => {
    const userData = testData.users.deleting;
    const cookie = await authorize(app, userData);
    const { id } = await models.user.query().findOne({ email: userData.email });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    await expect(models.user.query().findById(id))
      .resolves
      .toBeFalsy();
  });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
