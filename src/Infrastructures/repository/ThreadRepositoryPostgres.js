const AddedThread = require('../../Domains/threads/entities/AddedThread');
const Thread = require('../../Domains/threads/entities/Thread');
const AddedComment = require('../../Domains/threads/entities/AddedComment');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const UserRepositoryPostgres = require('./UserRepositoryPostgres');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._userRepositoryPostgres = new UserRepositoryPostgres(pool, idGenerator);
  }

  async addThread(payload, owner) {
    const { title, body } = payload;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async addComment(payload, thread, owner) {
    const { content } = payload;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, false) RETURNING id, content, owner',
      values: [id, thread, owner, content],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete=$1 WHERE id=$2',
      values: [true, commentId],
    };

    const result = await this._pool.query(query);
    return true;
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const thread = result.rows[0];

    return new Thread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: await this._userRepositoryPostgres.getUsernameById(thread.owner),
      comments: await this.getCommentsByThreadId(id)
    });
  }
  async getCommentsByThreadId(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread = $1 ORDER BY date ASC',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return Promise.all(
      result.rows.map(async (comment) => {
        if (comment.is_delete) comment.content = '**komentar telah dihapus**';
        comment.username = await this._userRepositoryPostgres.getUsernameById(comment.owner);
        return comment;
      })
    );
  }
  async getCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const { content } = result.rows[0];

    return content;
  }

  async checkOwnerComment(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('tidak dapat menghapus komentar');
    }

    const { content } = result.rows[0];

    return content;
  }
}

module.exports = ThreadRepositoryPostgres;
