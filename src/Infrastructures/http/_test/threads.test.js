const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    const server = await createServer(container);

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
  });
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when request with No Authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response with status code 200', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });
      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request with No Authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        content: 'content',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request with No Authentication', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-123/comments/comment-123`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });
      // Action
      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request with No Authentication', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-123/comments/comment-123/replies`,
        payload: {
          content: 'dicoding',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted reply', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'sebuah balasan',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-xxx/comments/comment-xxx/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'sebuah balasan',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/comment-xxx/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'sebuah balasan',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: ['Dicoding Indonesia'],
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request with No Authentication', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-123/comments/comment-123/replies/reply-123`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 and soft delete the reply', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      const addedReply = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'sebuah balasan',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies/${JSON.parse(addedReply.payload).data.addedReply.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findRepliesById(JSON.parse(addedReply.payload).data.addedReply.id);
      expect(replies[0].is_delete).toEqual(true);
    });

    it('should response 404 when reply not found', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${JSON.parse(addedThread.payload).data.addedThread.id}/comments/${JSON.parse(addedComment.payload).data.addedComment.id}/replies/reply-xxx`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const addThreadAndComment = async (server, token) => {
      const addedThread = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        },
      });

      const threadId = JSON.parse(addedThread.payload).data.addedThread.id;

      const addedComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        payload: {
          content: 'dicoding',
        },
      });

      return { threadId, commentId: JSON.parse(addedComment.payload).data.addedComment.id };
    };

    it('should response 401 when request with No Authentication', async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-123/comments/comment-123/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 and persist the like when comment is not liked yet', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(server, token);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and remove the like when comment is already liked', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(server, token);

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });

    it('should response 404 when thread not found', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-xxx/comments/comment-xxx/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId } = await addThreadAndComment(server, token);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-xxx/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should expose likeCount of a comment when GET /threads/{threadId}', async () => {
      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(server, token);

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
    });
  });
});
