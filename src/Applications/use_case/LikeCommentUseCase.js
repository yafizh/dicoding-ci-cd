
class LikeCommentUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(commentId, threadId, token) {
    const { id: userId } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(threadId);
    await this._threadRepository.getCommentById(commentId);

    const isLiked = await this._threadRepository.verifyCommentLike(commentId, userId);

    if (isLiked) {
      return this._threadRepository.unlikeComment(commentId, userId);
    }

    return this._threadRepository.likeComment(commentId, userId);
  }
}

module.exports = LikeCommentUseCase;
