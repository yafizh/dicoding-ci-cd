const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/',
    handler: () => ({
      value: 'Hello world!',
    }),
  },
];

module.exports = routes;
