const Hapi = require('@hapi/hapi');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');

const createServer = async (container) => {
  const server = Hapi.server({
    host: "0.0.0.0",
    // port: process.env.HOST,
    port: process.env.PORT || 5000,
  });

  let registering = null;
  if (process.env.NODE_ENV === 'test') {
    registering = [
      {
        plugin: users,
        options: { container },
      },
      {
        plugin: authentications,
        options: { container },
      },
      {
        plugin: threads,
        options: { container },
      },
    ];
  } else {
    registering = [
      {
        plugin: require('hapi-rate-limit'),
        options: {},
      },
      {
        plugin: users,
        options: { container },
      },
      {
        plugin: authentications,
        options: { container },
      },
      {
        plugin: threads,
        options: { container },
      },
    ];
  }
  await server.register(registering);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      // bila response tersebut error, tangani sesuai kebutuhan
      const translatedError = DomainErrorTranslator.translate(response);

      // penanganan client error secara internal.
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!translatedError.isServer) {
        return h.continue;
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  return server;
};

module.exports = createServer;
