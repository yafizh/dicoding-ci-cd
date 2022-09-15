const AddComment = require('../../Domains/threads/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(content, thread, token) {
    const { id: userId } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(thread);
    const addComment = new AddComment(content);
    return this._threadRepository.addComment(addComment, thread, userId);
  }
}

module.exports = AddCommentUseCase;
