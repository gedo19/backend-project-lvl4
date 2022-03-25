import objectionUnique from 'objection-unique';
import path from 'path';
import { Model } from 'objection';

const unique = objectionUnique({ fields: ['name'] });

export default class TaskStatus extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'statuses.id',
          to: 'tasks.status_id',
        },
      },
    };
  }
}
