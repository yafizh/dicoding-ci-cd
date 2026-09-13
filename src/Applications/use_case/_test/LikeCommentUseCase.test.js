const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/threads/entities/Comment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
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

  const fakeAuthenticationTokenManager = {
    decodePayload: () => {
      return Promise.resolve({ id: userId });
    },
  };

  it('should orchestrating the like comment action correctly when comment is not liked yet', async () => {
    // Arrange
    const expectedLikedComment = true;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn().mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentById = vi.fn().mockImplementation(() => Promise.resolve(expectedComment));
    mockThreadRepository.verifyCommentLike = vi.fn().mockImplementation(() => Promise.resolve(false));
    mockThreadRepository.likeComment = vi.fn().mockImplementation(() => Promise.resolve(expectedLikedComment));
    mockThreadRepository.unlikeComment = vi.fn().mockImplementation(() => Promise.resolve(true));

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const likedComment = await likeCommentUseCase.execute(commentId, threadId, userId);

    // Assert
    expect(likedComment).toStrictEqual(expectedLikedComment);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getCommentById).toBeCalledWith(commentId);
    expect(mockThreadRepository.verifyCommentLike).toBeCalledWith(commentId, userId);
    expect(mockThreadRepository.likeComment).toBeCalledWith(commentId, userId);
    expect(mockThreadRepository.unlikeComment).not.toBeCalled();
  });

  it('should orchestrating the cancel like comment action correctly when comment is already liked', async () => {
    // Arrange
    const expectedUnlikedComment = true;

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn().mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentById = vi.fn().mockImplementation(() => Promise.resolve(expectedComment));
    mockThreadRepository.verifyCommentLike = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.likeComment = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockThreadRepository.unlikeComment = vi.fn().mockImplementation(() => Promise.resolve(expectedUnlikedComment));

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const unlikedComment = await likeCommentUseCase.execute(commentId, threadId, userId);

    // Assert
    expect(unlikedComment).toStrictEqual(expectedUnlikedComment);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getCommentById).toBeCalledWith(commentId);
    expect(mockThreadRepository.verifyCommentLike).toBeCalledWith(commentId, userId);
    expect(mockThreadRepository.unlikeComment).toBeCalledWith(commentId, userId);
    expect(mockThreadRepository.likeComment).not.toBeCalled();
  });
});
