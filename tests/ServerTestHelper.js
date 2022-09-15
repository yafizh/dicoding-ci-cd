/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ServerTestHelper = {

  async getAccessToken(token) {
    const query = {
      text: 'SELECT token FROM authentications',
    };

    const result = await pool.query(query);

    return result.rows;
  },
};

module.exports = ServerTestHelper;
