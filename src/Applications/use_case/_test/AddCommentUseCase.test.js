const AddComment = require('../../../Domains/threads/entities/AddComment');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'dicoding',
    };

    thread = 'thread-123';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-321',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    const fakeAuthenticationTokenManager = {
      decodePayload: () => {
        return Promise.resolve({ id: expectedAddedComment.owner });
      },
    };

    /** mocking needed function */
    mockThreadRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(expectedAddedComment));
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(thread));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload, thread, expectedAddedComment.owner);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
      }),
      thread,
      expectedAddedComment.owner
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(thread);
  });
});
