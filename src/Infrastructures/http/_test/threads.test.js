const request = require('supertest');
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
    const app = await createServer(container);

    await request(app)
      .post('/users')
      .send({
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

    await request(app)
      .post('/authentications')
      .send({
        username: 'dicoding',
        password: 'secret',
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

      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'Dicoding Indonesia',
      };

      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: ['Dicoding Indonesia'],
      };
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
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
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);
      // Action
      const response = await request(app)
        .get(`/threads/${addedThread.body.data.addedThread.id}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request with No Authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'dicoding',
      };

      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 201 and persisted user', async () => {
      // Arrange
      const requestPayload = {
        content: 'content',
      };

      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['Dicoding Indonesia'],
      };
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(requestPayload);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request with No Authentication', async () => {
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete(`/threads/thread-123/comments/comment-123`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });
      // Action
      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      // Action
      const response = await request(app)
        .delete(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request with No Authentication', async () => {
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post(`/threads/thread-123/comments/comment-123/replies`)
        .send({
          content: 'dicoding',
        });

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted reply', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'sebuah balasan',
        });

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await request(app)
        .post(`/threads/thread-xxx/comments/comment-xxx/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'sebuah balasan',
        });

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments/comment-xxx/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'sebuah balasan',
        });

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      // Action
      const response = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: ['Dicoding Indonesia'],
        });

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request with No Authentication', async () => {
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete(`/threads/thread-123/comments/comment-123/replies/reply-123`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 and soft delete the reply', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      const addedReply = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'sebuah balasan',
        });

      // Action
      const response = await request(app)
        .delete(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies/${addedReply.body.data.addedReply.id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findRepliesById(addedReply.body.data.addedReply.id);
      expect(replies[0].is_delete).toEqual(true);
    });

    it('should response 404 when reply not found', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const addedComment = await request(app)
        .post(`/threads/${addedThread.body.data.addedThread.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      // Action
      const response = await request(app)
        .delete(`/threads/${addedThread.body.data.addedThread.id}/comments/${addedComment.body.data.addedComment.id}/replies/reply-xxx`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const addThreadAndComment = async (app, token) => {
      const addedThread = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'dicoding',
          body: 'Dicoding Indonesia',
        });

      const threadId = addedThread.body.data.addedThread.id;

      const addedComment = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'dicoding',
        });

      return { threadId, commentId: addedComment.body.data.addedComment.id };
    };

    it('should response 401 when request with No Authentication', async () => {
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put(`/threads/thread-123/comments/comment-123/likes`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 and persist the like when comment is not liked yet', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(app, token);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and remove the like when comment is already liked', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(app, token);

      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      // Action
      const response = await request(app)
        .put(`/threads/thread-xxx/comments/comment-xxx/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId } = await addThreadAndComment(app, token);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/comment-xxx/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should expose likeCount of a comment when GET /threads/{threadId}', async () => {
      const app = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken();
      const { token } = accessToken[0];

      const { threadId, commentId } = await addThreadAndComment(app, token);

      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${token}`);

      // Action
      const response = await request(app)
        .get(`/threads/${threadId}`);

      // Assert
      const responseJson = response.body;
      expect(response.status).toEqual(200);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
    });
  });
});
