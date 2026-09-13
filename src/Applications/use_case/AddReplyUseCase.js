const AddReply = require('../../Domains/threads/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(content, thread, comment, token) {
    const { id: userId } = await this._authenticationTokenManager.decodePayload(token);
    await this._threadRepository.getThreadById(thread);
    await this._threadRepository.getCommentById(comment);
    const addReply = new AddReply(content);
    return this._threadRepository.addReply(addReply, comment, userId);
  }
}

module.exports = AddReplyUseCase;
