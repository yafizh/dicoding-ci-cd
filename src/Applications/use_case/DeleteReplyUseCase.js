
class DeleteReplyUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(replyId, commentId, threadId, token) {
    const { id: userId } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(threadId);
    await this._threadRepository.getCommentById(commentId);
    await this._threadRepository.getReplyById(replyId);
    await this._threadRepository.checkOwnerReply(replyId, userId);
    return this._threadRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
