const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/threads/entities/Comment');
const Reply = require('../../../Domains/threads/entities/Reply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const replyId = 'reply-123';
    const commentId = 'comment-123';
    const threadId = 'thread-123';
    const userId = 'user-123';

    const expectedThread = new Thread({
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi thread',
      username: 'dicoding',
      date: 123,
      comments: [],
    });

    const expectedComment = new Comment({
      id: 'comment-123',
      username: expectedThread.username,
      content: 'isi comment',
    });

    const expectedReply = new Reply({
      id: 'reply-123',
      username: expectedThread.username,
      content: 'isi balasan',
    });

    const expectedCheckOwnerReply = true;
    const expectedDeletedReply = true;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    const fakeAuthenticationTokenManager = {
      decodePayload: () => {
        return Promise.resolve({ id: userId });
      },
    };

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve(expectedComment));
    mockThreadRepository.getReplyById = jest.fn().mockImplementation(() => Promise.resolve(expectedReply));
    mockThreadRepository.checkOwnerReply = jest.fn().mockImplementation(() => Promise.resolve(expectedCheckOwnerReply));
    mockThreadRepository.deleteReply = jest.fn().mockImplementation(() => Promise.resolve(expectedDeletedReply));

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const deletedReply = await deleteReplyUseCase.execute(replyId, commentId, threadId, userId);

    // Assert
    expect(deletedReply).toStrictEqual(expectedDeletedReply);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getCommentById).toBeCalledWith(commentId);
    expect(mockThreadRepository.getReplyById).toBeCalledWith(replyId);
    expect(mockThreadRepository.checkOwnerReply).toBeCalledWith(replyId, userId);
    expect(mockThreadRepository.deleteReply).toBeCalledWith(replyId);
  });
});
