class Comment {
    constructor(payload) {
      this._verifyPayload(payload);
  
      this.id = payload.id;
      this.username = payload.username;
      this.content = payload.content;
    }
  
    _verifyPayload(payload) {
      const { id, username, content } = payload;
  
      if (!id || !username || !content) {
        throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
      }
  
      if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string') {
        throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
    }
  }
  
  module.exports = Comment;
  