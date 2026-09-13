const AddReply = require('../AddReply');

describe('AddReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new AddReply({})).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: true,
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply entities correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah balasan',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply).toBeInstanceOf(AddReply);
    expect(addReply.content).toEqual(payload.content);
  });
});
