// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get(
      '/statuses',
      { name: 'statuses', preValidation: app.authenticate },
      async (req, reply) => {
        const taskStatuses = await app.objection.models.taskStatus.query();
        reply.render('statuses/index', { taskStatuses });
        return reply;
      },
    )
    .get(
      '/statuses/new',
      { name: 'newStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const taskStatus = new app.objection.models.taskStatus();
        reply.render('statuses/new', { taskStatus });
        return reply;
      },
    )
    .get(
      '/statuses/:id/edit',
      { name: 'editStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;

        const taskStatus = await app.objection.models.taskStatus.query().findById(id);
        reply.render('statuses/edit', { taskStatus });
        return reply;
      },
    )
    .post(
      '/statuses',
      { name: 'postStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { data } = req.body;

        try {
          await app.objection.models.taskStatus.query().insert(data);

          req.flash('success', i18next.t('flash.statuses.create.success'));
          return reply.redirect(app.reverse('statuses'));
        } catch ({ data: errors }) {
          req.flash('error', i18next.t('flash.statuses.create.error'));
          reply.code(422).render('statuses/new', { taskStatus: data, errors });
          return reply;
        }
      },
    )
    .patch(
      '/statuses/:id',
      { name: 'updateStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const { data } = req.body;

        const taskStatus = await app.objection.models.taskStatus.query().findById(id);
        try {
          await taskStatus.$query().patch(data);

          req.flash('success', i18next.t('flash.statuses.edit.success'));
          return reply.redirect(app.reverse('statuses'));
        } catch ({ data: errors }) {
          taskStatus.$set(data);

          req.flash('error', i18next.t('flash.statuses.edit.error'));
          reply.render('statuses/edit', { taskStatus, errors });
          return reply;
        }
      },
    )
    .delete(
      '/statuses/:id',
      { name: 'deleteStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const taskStatus = await app.objection.models.taskStatus.query().findById(id);
        const tasks = await taskStatus.$relatedQuery('tasks');

        if (_.isEmpty(tasks)) {
          await taskStatus.$query().deleteById(id);
          req.flash('success', i18next.t('flash.statuses.delete.success'));
        } else {
          req.flash('error', i18next.t('flash.statuses.delete.error'));
        }

        return reply.redirect(app.reverse('statuses'));
      },
    );
};
