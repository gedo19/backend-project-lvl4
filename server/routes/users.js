// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get('/users', { name: 'users#index' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'users#new' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
      return reply;
    })
    .get(
      '/users/:id/edit',
      { name: 'users#edit', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.edit.accessError'));
          return reply.redirect(app.reverse('users#index'));
        }

        const user = await app.objection.models.user.query().findById(userId);

        reply.render('users/edit', { user });
        return reply;
      },
    )
    .post('/users', { name: 'users#create' }, async (req, reply) => {
      const { data } = req.body;

      try {
        await app.objection.models.user.query().insert(data);

        req.flash('info', i18next.t('flash.users.create.success'));
        return reply.redirect(app.reverse('root#index'));
      } catch (e) {
        console.log(e)
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.code(422).render('users/new', { user: data, errors: e.data });
        return reply;
      }
    })
    .patch(
      '/users/:id',
      { name: 'users#update', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;
        const { data } = req.body;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.edit.accessError'));
          return reply.redirect(app.reverse('users#index'));
        }

        const user = await app.objection.models.user.query().findById(userId);
        try {
          await user.$query().patch(data);

          req.flash('success', i18next.t('flash.users.edit.success'));
          return reply.redirect(app.reverse('users#index'));
        } catch ({ data: errors }) {
          user.$set(data);
          reply.code(422).render('users/edit', { user, errors });
          return reply;
        }
      },
    )
    .delete(
      '/users/:id',
      { name: 'users#destroy', preValidation: app.authenticate },
      async (req, reply) => {
        const { id: userId } = req.user;

        if (Number(req.params.id) !== userId) {
          req.flash('error', i18next.t('flash.users.delete.accessError'));
          return reply.redirect(app.reverse('users#index'));
        }

        const user = await app.objection.models.user.query().findById(userId);
        const [createdTasks, assignedTasks] = await Promise.all([
          user.$relatedQuery('createdTasks'),
          user.$relatedQuery('assignedTasks'),
        ]);

        if (_.isEmpty(createdTasks) && _.isEmpty(assignedTasks)) {
          await user.$query().deleteById(userId);
          await req.logOut();
          req.flash('success', i18next.t('flash.users.delete.success'));
        } else {
          req.flash('error', i18next.t('flash.users.delete.error'));
        }

        return reply.redirect(app.reverse('users#index'));
      },
    );
};
