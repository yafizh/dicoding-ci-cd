require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  const app = await createServer(container);
  const port = process.env.PORT || 5000;

  app.listen(port, '0.0.0.0', () => {
    console.log(`server start at http://0.0.0.0:${port}`);
  });
})();
