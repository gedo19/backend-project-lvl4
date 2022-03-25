// @ts-check

import objectionUnique from 'objection-unique';
import encrypt from '../lib/secure.js';
import path from 'path';
import { Model } from 'objection';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['lastname', 'lastname', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstname: { type: 'string', minLength: 1 },
        lastname: { type: 'string', minLength: 1 },
        email: { type: 'string' },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  get name() {
    return `${this.firstname} ${this.lastname}`;
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }

  static get relationMappings() {
    return {
      createdTasks: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'users.id',
          to: 'tasks.creator_id',
        },
      },
      assignedTasks: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'users.id',
          to: 'tasks.executor_id',
        },
      },
    };
  }
}
