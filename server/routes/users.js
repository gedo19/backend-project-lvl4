// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
      return reply;
    })
    .get(
      '/users/:id/edit',
      { name: 'editUser', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.edit.error'));
          return reply.redirect(app.reverse('users'));
        }

        const user = await app.objection.models.user.query().findById(userId);

        reply.render('users/edit', { user });
        return reply;
      },
    )
    .post('/users', { name: 'postUser' }, async (req, reply) => {
      const { data } = req.body;

      try {
        const user = await app.objection.models.user.fromJson(data);
        await app.objection.models.user.query().insert(user);

        req.flash('info', i18next.t('flash.users.create.success'));
        return reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: data, errors: e.data });
        return reply;
      }
    })
    .patch(
      '/users/:id',
      { name: 'updateUser', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;
        const { data } = req.body;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.edit.error'));
          return reply.redirect(app.reverse('users'));
        }

        const user = await app.objection.models.user.query().findById(userId);
        try {
          await user.$query().patch(data);

          req.flash('success', i18next.t('flash.users.edit.success'));
          return reply.redirect(app.reverse('users'));
        } catch ({ data: errors }) {
          user.$set(data);
          reply.render('users/edit', { user, errors });
          return reply;
        }
      },
    )
    .delete(
      '/users/:id',
      { name: 'deleteUser', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.delete.error'));
          return reply.redirect(app.reverse('users'));
        }
        await req.logOut();
        await app.objection.models.user.query().deleteById(userId);
        req.flash('success', i18next.t('flash.users.delete.success'));
        return reply.redirect(app.reverse('users'));
      },
    );
};
