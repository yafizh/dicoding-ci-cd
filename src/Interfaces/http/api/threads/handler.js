const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async getThreadHandler(request, response) {
    const { threadId } = request.params;
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const thread = await getThreadUseCase.execute(threadId);

    response.status(200).json({
      status: 'success',
      data: {
        thread,
      },
    });
  }

  async postThreadHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.body, request.headers.authorization.split(' ')[1]);

    response.status(201).json({
      status: 'success',
      data: {
        addedThread,
      },
    });
  }

  async postCommentHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(request.body, threadId, request.headers.authorization.split(' ')[1]);

    response.status(201).json({
      status: 'success',
      data: {
        addedComment,
      },
    });
  }

  async deleteCommentHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(commentId, threadId, request.headers.authorization.split(' ')[1]);

    response.status(200).json({
      status: 'success',
    });
  }

  async postReplyHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(request.body, threadId, commentId, request.headers.authorization.split(' ')[1]);

    response.status(201).json({
      status: 'success',
      data: {
        addedReply,
      },
    });
  }

  async deleteReplyHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(replyId, commentId, threadId, request.headers.authorization.split(' ')[1]);

    response.status(200).json({
      status: 'success',
    });
  }

  async putCommentLikeHandler(request, response) {
    if (!request.headers.authorization) {
      response.status(401).json({
        message: 'Missing authentication',
      });
      return;
    }

    const { threadId, commentId } = request.params;
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    await likeCommentUseCase.execute(commentId, threadId, request.headers.authorization.split(' ')[1]);

    response.status(200).json({
      status: 'success',
    });
  }
}

module.exports = ThreadsHandler;
