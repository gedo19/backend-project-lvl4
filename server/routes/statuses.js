import i18next from 'i18next';

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

        // TODO: сделать проверку ну существование

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
          const taskStatus = await app.objection.models.taskStatus.fromJson(data);
          await app.objection.models.taskStatus.query().insert(taskStatus);

          return reply.redirect(app.reverse('statuses'));
        } catch (e) {
          req.flash('error', i18next.t('flash.statuses.create.error'));
          reply.render('statuses/new', { taskStatus: data, errors: e.data });
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
        } catch (e) {
          taskStatus.$set(data);
          reply.render('statuses/edit', { taskStatus, errors: e.data });
          return reply;
        }
      },
    )
    .delete(
      '/statuses/:id',
      { name: 'deleteStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;

        await app.objection.models.taskStatus.query().deleteById(id);
        req.flash('success', i18next.t('flash.statuses.delete.success'));
        return reply.redirect(app.reverse('statuses'));
      },
    );
};
