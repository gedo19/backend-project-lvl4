// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get(
      '/labels',
      { name: 'labels', preValidation: app.authorization },
      async (req, reply) => {
        const taskLabels = await app.objection.models.taskLabel.query();

        reply.render('labels/index', { taskLabels });
        return reply;
      },
    )
    .get(
      '/labels/new',
      { name: 'newLabel', preValidation: app.authorization },
      async (req, reply) => {
        const taskLabel = new app.objection.models.taskLabel();

        reply.render('labels/new', { taskLabel });
        return reply;
      },
    )
    .get(
      '/labels/:id/edit',
      { name: 'editLabel', preValidation: app.authorization },
      async (req, reply) => {
        const { id: taskLabelId } = req.params;
        const taskLabel = await app.objection.models.taskLabel.query().findById(taskLabelId);

        reply.render('labels/edit', { taskLabel });
        return reply;
      },
    )
    .post(
      '/labels',
      { name: 'postLabel', preValidation: app.authorization },
      async (req, reply) => {
        const { data } = req.body;

        try {
          await app.objection.models.taskLabel.query().insert(data);

          req.flash('success', i18next.t('flash.labels.create.success'));
          return reply.redirect(app.reverse('labels'));
        } catch ({ data: errors }) {
          req.flash('error', i18next.t('flash.labels.create.error'));
          reply.code(422).render('labels/new', { taskLabel: data, errors });
          return reply;
        }
      },
    )
    .patch(
      '/labels/:id',
      { name: 'updateLabel', preValidation: app.authorization },
      async (req, reply) => {
        const { id: taskLabelId } = req.params;
        const { data } = req.body;

        const taskLabel = await app.objection.models.taskLabel.query().findById(taskLabelId);
        try {
          await taskLabel.$query().patch(data);

          req.flash('success', i18next.t('flash.labels.edit.success'));
          return reply.redirect(app.reverse('labels'));
        } catch ({ data: errors }) {
          taskLabel.$set(data);

          req.flash('error', i18next.t('flash.labels.edit.error'));
          reply.code(422).render('labels/edit', { taskLabel, errors });
          return reply;
        }
      },
    )
    .delete(
      '/labels/:id',
      { name: 'deleteLabel', preValidation: app.authorization },
      async (req, reply) => {
        const { id: taskLabelId } = req.params;

        const taskLabel = await app.objection.models.taskLabel.query().findById(taskLabelId);
        const tasks = await taskLabel.$relatedQuery('tasks');

        if (_.isEmpty(tasks)) {
          await taskLabel.$query().deleteById(taskLabelId);

          req.flash('success', i18next.t('flash.labels.delete.success'));
        } else {
          req.flash('error', i18next.t('flash.labels.delete.error'));
        }

        return reply.redirect(app.reverse('labels'));
      },
    );
};
