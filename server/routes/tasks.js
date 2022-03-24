// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const tasks = await app.objection.models.task.query().withGraphFetched('[creator, executor, status]');
        reply.render('tasks/index', { tasks });
        return reply;
      },
    )
    .get(
      '/tasks/new',
      { name: 'newTask', preValidation: app.authenticate },
      async (req, reply) => {},
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
      async (req, reply) => {
        const { data } = req.body;

        try {
          const task = await app.objection.models.task.fromJson(data);
          await app.objection.models.task.query().insert(task);
          return reply.send('Success');
        } catch (e) {
          return reply.send(e);
        }
      },
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
