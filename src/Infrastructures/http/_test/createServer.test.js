const request = require('supertest');
const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app)
      .get('/unregisteredRoute');

    // Assert
    expect(response.status).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const app = await createServer({}); // fake injection

    // Action
    const response = await request(app)
      .post('/users')
      .send(requestPayload);

    // Assert
    const responseJson = response.body;
    expect(response.status).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });
});
