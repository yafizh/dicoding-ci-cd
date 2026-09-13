const AddReply = require('../../../Domains/threads/entities/AddReply');
const AddedReply = require('../../../Domains/threads/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'dicoding',
    };

    const thread = 'thread-123';
    const comment = 'comment-123';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-321',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    const fakeAuthenticationTokenManager = {
      decodePayload: () => {
        return Promise.resolve({ id: expectedAddedReply.owner });
      },
    };

    /** mocking needed function */
    mockThreadRepository.addReply = vi.fn().mockImplementation(() => Promise.resolve(expectedAddedReply));
    mockThreadRepository.getThreadById = vi.fn().mockImplementation(() => Promise.resolve(thread));
    mockThreadRepository.getCommentById = vi.fn().mockImplementation(() => Promise.resolve(comment));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload, thread, comment, expectedAddedReply.owner);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
      }),
      comment,
      expectedAddedReply.owner
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(thread);
    expect(mockThreadRepository.getCommentById).toBeCalledWith(comment);
  });
});
