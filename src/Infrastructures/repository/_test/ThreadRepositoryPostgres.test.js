const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddComment = require('../../../Domains/threads/entities/AddComment');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Thread = require('../../../Domains/threads/entities/Thread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadsRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkOwnerComment function', () => {
    it('should return not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      await expect(threadRepositoryPostgres.checkOwnerComment('comment-123', 'user-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should return comment correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({ content: 'content' });
      const thread = await threadRepositoryPostgres.checkOwnerComment('comment-123', 'user-123');

      // Assert
      expect(thread).toStrictEqual('content');
    });

    it('should return thread correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await ThreadsTableTestHelper.addThreads({});
      await UsersTableTestHelper.addUser({});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: 'thread-123',
          title: 'dicoding',
          body: 'Dicoding Indonesia',
          username: 'dicoding',
          date: result.date,
          comments: [],
        })
      );
    });
  });

  describe('getCommentById function', () => {
    it('should return not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      await expect(threadRepositoryPostgres.getCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return comment correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({ content: 'content' });
      const thread = await threadRepositoryPostgres.getCommentById('comment-123');

      // Assert
      expect(thread).toStrictEqual('content');
    });

    it('should return thread correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await ThreadsTableTestHelper.addThreads({});
      await UsersTableTestHelper.addUser({});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: 'thread-123',
          title: 'dicoding',
          body: 'Dicoding Indonesia',
          username: 'dicoding',
          date: result.date,
          comments: [],
        })
      );
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return correcly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      // Assert
      const comments = await threadRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(comments).toHaveLength(1);
    });
  });

  describe('getThreadById function', () => {
    it('should return not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await ThreadsTableTestHelper.addThreads({});
      await UsersTableTestHelper.addUser({});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: 'thread-123',
          title: 'dicoding',
          body: 'Dicoding Indonesia',
          username: 'dicoding',
          date: result.date,
          comments: [],
        })
      );
    });

    it('should return thread correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await ThreadsTableTestHelper.addThreads({});
      await UsersTableTestHelper.addUser({});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual(
        new Thread({
          id: 'thread-123',
          title: 'dicoding',
          body: 'Dicoding Indonesia',
          username: 'dicoding',
          date: result.date,
          comments: [],
        })
      );
    });
  });

  describe('deleteComment function', () => {
    it('should return true', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      const deletedComment = await threadRepositoryPostgres.deleteComment('comment-123');

      // Assert
      expect(deletedComment).toStrictEqual(true);
    });
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'dicoding',
          owner: owner,
        })
      );
    });
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const owner = 'user-123';
      const thread = 'thread-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addComment(addComment, thread, owner);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return comment thread correctly', async () => {
      const addComment = new AddComment({
        content: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const thread = 'thread-123';
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await threadRepositoryPostgres.addComment(addComment, thread, owner);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: addComment.content,
          owner: owner,
        })
      );
    });
  });
});
