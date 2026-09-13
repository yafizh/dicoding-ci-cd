const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new Reply({})).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 123,
      content: 'sebuah balasan',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      content: 'sebuah balasan',
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.username).toEqual(payload.username);
    expect(reply.content).toEqual(payload.content);
  });
});
