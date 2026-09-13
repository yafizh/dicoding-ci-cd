const express = require('express');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');

const createServer = async (container) => {
  const app = express();

  app.use(express.json());

  app.use(users(container));
  app.use(authentications(container));
  app.use(threads(container));

  // penanganan route yang tidak terdaftar
  app.use((request, response) => {
    response.status(404).json({
      status: 'fail',
      message: 'route tidak ditemukan',
    });
  });

  // Express 5 meneruskan promise yang reject dari handler async ke middleware ini
  // eslint-disable-next-line no-unused-vars
  app.use((error, request, response, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    // penanganan client error secara internal
    if (translatedError instanceof ClientError) {
      return response.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
    return response.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;
