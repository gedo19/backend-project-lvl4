// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get(
      '/tasks',
      { name: 'tasks', preValidation: app.authenticate },
      async (req, reply) => {
        const {
          status: statusId,
          executor: executorId,
          label: labelId,
          isCreatorUser,
        } = req.query;

        const tasksQuery = app.objection.models.task
          .query()
          .modify('filterExecutor', executorId)
          .modify('filterStatus', statusId)
          .modify('filterLabel', labelId)
          .modify('filterByOwner', isCreatorUser ? req.user.id : null)
          .withGraphJoined('[status, creator, executor, labels]');

        const [tasks, taskStatuses, executors, taskLabels] = await Promise.all([
          tasksQuery,
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
          app.objection.models.taskLabel.query(),
        ]);
        reply.render('tasks/index', {
          tasks, taskStatuses, executors, taskLabels, filterCriterias: req.query,
        });
        return reply;
      },
    )
    .get(
      '/tasks/new',
      { name: 'newTask', preValidation: app.authenticate },
      async (req, reply) => {
        const task = new app.objection.models.task();
        const [users, taskStatuses, taskLabels] = await Promise.all([
          app.objection.models.user.query(),
          app.objection.models.taskStatus.query(),
          app.objection.models.taskLabel.query(),
        ]);

        reply.render('tasks/new', {
          task, users, taskStatuses, taskLabels,
        });
        return reply;
      },
    )
    .get(
      '/tasks/:id',
      { name: 'task', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: taskId } = req.params;
        const task = await app.objection.models.task
          .query()
          .withGraphJoined('[status, creator, executor, labels]')
          .findById(taskId);

        reply.render('tasks/task', { task });
        return reply;
      },
    )
    .get(
      '/tasks/:id/edit',
      { name: 'editTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: taskId } = req.params;

        const [task, taskStatuses, taskLabels, users] = await Promise.all([
          app.objection.models.task.query().withGraphJoined('[labels]').findById(taskId),
          app.objection.models.taskStatus.query(),
          app.objection.models.taskLabel.query(),
          app.objection.models.user.query(),
        ]);

        reply.render('tasks/edit', {
          task, taskStatuses, taskLabels, users,
        });
        return reply;
      },
    )
    .post(
      '/tasks',
      { name: 'postTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { data } = req.body;

        const labelsIds = _.toArray(_.get(data, 'labels', []));
        const labels = await app.objection.models.taskLabel.query().findByIds(labelsIds);

        const taskData = {
          name: data.name,
          description: data.description,
          statusId: Number(data.statusId),
          creatorId: Number(req.user.id),
          executorId: data.executorId ? Number(data.executorId) : null,
          labels,
        };

        try {
          await app.objection.models.task.transaction(async (trx) => {
            await app.objection.models.task
              .query(trx)
              .insertGraph(taskData, { relate: true });
          });

          req.flash('info', i18next.t('flash.tasks.create.success'));
          return reply.redirect(app.reverse('tasks'));
        } catch ({ data: errors }) {
          const [users, taskStatuses, taskLabels] = await Promise.all([
            app.objection.models.user.query(),
            app.objection.models.taskStatus.query(),
            app.objection.models.taskLabel.query(),
          ]);
          req.flash('error', i18next.t('flash.tasks.create.error'));
          reply.render('tasks/new', {
            task: taskData, users, taskStatuses, taskLabels, errors,
          });
          return reply;
        }
      },
    )
    .patch(
      '/tasks/:id',
      { name: 'updateTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: taskId } = req.params;
        const { data } = req.body;

        const labelsIds = _.toArray(_.get(data, 'labels', []));
        const [task, labels] = await Promise.all([
          app.objection.models.task
            .query()
            .withGraphJoined('[status, creator, executor, labels]')
            .findById(taskId),
          app.objection.models.taskLabel.query().findByIds(labelsIds),
        ]);

        const taskData = {
          name: data.name,
          description: data.description,
          statusId: Number(data.statusId),
          executorId: data.executorId ? Number(data.executorId) : null,
        };

        try {
          await app.objection.models.task.transaction(async (trx) => {
            await task.$relatedQuery('labels', trx).unrelate();
            await task.$query(trx).patch(taskData);
            await Promise.all(labels.map((label) => task.$relatedQuery('labels', trx).relate(label)));
          });

          req.flash('success', i18next.t('flash.tasks.edit.success'));
          return reply.redirect(app.reverse('tasks'));
        } catch ({ data: errors }) {
          const [taskStatuses, taskLabels, users] = await Promise.all([
            app.objection.models.taskStatus.query(),
            app.objection.models.taskLabel.query(),
            app.objection.models.user.query(),
          ]);
          task.$set(taskData);

          req.flash('error', i18next.t('flash.tasks.edit.error'));
          reply.render('tasks/edit', {
            task, taskStatuses, taskLabels, users, errors,
          });
          return reply;
        }
      },
    )
    .delete(
      '/tasks/:id',
      { name: 'deleteTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: taskId } = req.params;

        const task = await app.objection.models.task.query().findById(taskId);

        if (req.user.id !== task.creatorId) {
          req.flash('error', i18next.t('flash.tasks.delete.accessError'));
          return reply.redirect(app.reverse('tasks'));
        }

        await app.objection.models.task.transaction(async (trx) => {
          await task.$relatedQuery('labels', trx).unrelate();
          await task.$query(trx).delete();
        });

        req.flash('success', i18next.t('flash.tasks.delete.success'));
        return reply.redirect(app.reverse('tasks'));
      },
    );
};
