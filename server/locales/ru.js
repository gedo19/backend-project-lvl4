// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вход выполнен',
          error: 'Неправильный e-mail или пароль',
        },
        delete: {
          success: 'Выход выполнен',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Вы не можете редактировать другого пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Вы не можете удалять другого пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, выполните вход',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        editUser: 'Изменение пользователя',
        statuses: 'Статусы',
        createStatus: 'Создание статуса',
        editStatus: 'Изменение статуса',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      placeholders: {
        firstname: 'Имя',
        lastname: 'Фамилия',
        email: 'Email',
        password: 'Пароль',
        name: 'Наименование',
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        options: 'Опции',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          submit: 'Изменить',
          cancel: 'Отмена',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        options: 'Опции',
        create: 'Создать статус',
        new: {
          create: 'Создать статус',
          submit: 'Создать',
        },
        edit: {
          submit: 'Изменить',
          cancel: 'Отмена',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      welcome: {
        index: {
          hello: 'Добро пожаловать!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
