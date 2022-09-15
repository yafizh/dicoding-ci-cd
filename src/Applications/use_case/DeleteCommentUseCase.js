
class DeleteCommentUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(commentId, threadId, token) {
    const { id: userId } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(threadId);
    await this._threadRepository.getCommentById(commentId);
    await this._threadRepository.checkOwnerComment(commentId, userId);
    return this._threadRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
