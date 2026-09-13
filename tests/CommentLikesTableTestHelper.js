/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addLike({ id = 'like-123', comment = 'comment-123', owner = 'user-123' }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, comment, owner],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findLikesByCommentId(comment) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment = $1',
      values: [comment],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
