// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const tasks = await app.objection.models.task.query().withGraphFetched(`[status, creator, executor]`);
        reply.render('tasks/index', { tasks });
        return reply;
      },
    )
    .get(
      '/tasks/new',
      { name: 'newTask', preValidation: app.authenticate },
      async (req, reply) => {
        const task = new app.objection.models.task();
        const users = await app.objection.models.user.query();
        const taskStatuses = await app.objection.models.taskStatus.query();
        reply.render('tasks/new', { task, users, taskStatuses });
        return reply;
      },
    )
    .get(
      '/tasks/:id',
      { name: 'task', preValidation: app.authenticate },
      async (req, reply) => {},
    )
    .get(
      '/tasks/:id/edit',
      { name: 'editTask', preValidation: app.authenticate },
      async (req, reply) => {},
    )
    .post(
      '/tasks',
      { name: 'postTask' },
      async (req, reply) => {},
    )
    .patch(
      '/tasks/:id',
      { name: 'updateTask', preValidation: app.authenticate },
      async (req, reply) => {},
    )
    .delete(
      '/tasks/:id',
      { name: 'deleteTask', preValidation: app.authenticate },
      async (req, reply) => {},
    );
};
