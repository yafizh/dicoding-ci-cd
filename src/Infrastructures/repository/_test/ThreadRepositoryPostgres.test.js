const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddComment = require('../../../Domains/threads/entities/AddComment');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AddReply = require('../../../Domains/threads/entities/AddReply');
const AddedReply = require('../../../Domains/threads/entities/AddedReply');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const Thread = require('../../../Domains/threads/entities/Thread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadsRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
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
      expect(comments[0].likeCount).toStrictEqual(0);
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

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const owner = 'user-123';
      const comment = 'comment-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addReply(addReply, comment, owner);

      // Assert
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const addReply = new AddReply({
        content: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const comment = 'comment-123';
      const owner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await threadRepositoryPostgres.addReply(addReply, comment, owner);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: addReply.content,
          owner: owner,
        })
      );
    });
  });

  describe('getReplyById function', () => {
    it('should return not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      await expect(threadRepositoryPostgres.getReplyById('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return reply correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ content: 'content' });
      const reply = await threadRepositoryPostgres.getReplyById('reply-123');

      // Assert
      expect(reply).toStrictEqual('content');
    });
  });

  describe('checkOwnerReply function', () => {
    it('should throw authorization error when user is not the owner', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      await expect(threadRepositoryPostgres.checkOwnerReply('reply-123', 'user-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should return reply correcly', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({ content: 'content' });
      const reply = await threadRepositoryPostgres.checkOwnerReply('reply-123', 'user-123');

      // Assert
      expect(reply).toStrictEqual('content');
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty array when comment has no reply', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      expect(await threadRepositoryPostgres.getRepliesByCommentId('comment-123')).toStrictEqual([]);
    });

    it('should return replies correcly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});

      // Assert
      const replies = await threadRepositoryPostgres.getRepliesByCommentId('comment-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toStrictEqual('reply-123');
      expect(replies[0].username).toStrictEqual('dicoding');
      expect(replies[0].content).toStrictEqual('Dicoding Indonesia');
    });

    it('should mask content of deleted reply', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      await threadRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await threadRepositoryPostgres.getRepliesByCommentId('comment-123');
      expect(replies[0].content).toStrictEqual('**balasan telah dihapus**');
    });
  });

  describe('deleteReply function', () => {
    it('should return true', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await RepliesTableTestHelper.addReply({});
      const deletedReply = await threadRepositoryPostgres.deleteReply('reply-123');

      // Assert
      expect(deletedReply).toStrictEqual(true);
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(reply[0].is_delete).toStrictEqual(true);
    });
  });

  describe('likeComment function', () => {
    it('should persist like and return true', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      const likedComment = await threadRepositoryPostgres.likeComment('comment-123', 'user-123');

      // Assert
      expect(likedComment).toStrictEqual(true);
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toStrictEqual('like-123');
      expect(likes[0].owner).toStrictEqual('user-123');
    });
  });

  describe('unlikeComment function', () => {
    it('should remove like and return true', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await CommentLikesTableTestHelper.addLike({});
      const unlikedComment = await threadRepositoryPostgres.unlikeComment('comment-123', 'user-123');

      // Assert
      expect(unlikedComment).toStrictEqual(true);
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('verifyCommentLike function', () => {
    it('should return false when user has not liked the comment', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});

      // Assert
      expect(await threadRepositoryPostgres.verifyCommentLike('comment-123', 'user-123')).toStrictEqual(false);
    });

    it('should return true when user has liked the comment', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await CommentLikesTableTestHelper.addLike({});

      // Assert
      expect(await threadRepositoryPostgres.verifyCommentLike('comment-123', 'user-123')).toStrictEqual(true);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return 0 when comment has no like', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Assert
      expect(await threadRepositoryPostgres.getLikeCountByCommentId('comment-123')).toStrictEqual(0);
    });

    it('should return like count correcly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({});
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'johndoe' });
      await ThreadsTableTestHelper.addThreads({});
      await CommentsTableTestHelper.addComment({});
      await CommentLikesTableTestHelper.addLike({});
      await CommentLikesTableTestHelper.addLike({ id: 'like-321', owner: 'user-321' });

      // Assert
      expect(await threadRepositoryPostgres.getLikeCountByCommentId('comment-123')).toStrictEqual(2);
    });
  });
});
