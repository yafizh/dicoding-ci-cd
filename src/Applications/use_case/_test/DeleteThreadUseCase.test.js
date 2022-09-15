const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/threads/entities/Comment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add trhead action correctly', async () => {
    // Arrange
    
    const commentId = 'comment-123';
    const threadtId = 'threadt-123';
    const usertId = 'usert-123';

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
      content: 'isi thread',
    });

    const expectedCheckOwnerComment = true;
    const expectedDeletedComment = true;


    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    const fakeAuthenticationTokenManager = {
      decodePayload: () => {
        return Promise.resolve({ id: usertId });
      },
    };

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve(expectedComment));
    mockThreadRepository.checkOwnerComment = jest.fn().mockImplementation(() => Promise.resolve(expectedCheckOwnerComment));
    mockThreadRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve(expectedDeletedComment));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const deletedComment = await deleteCommentUseCase.execute(commentId, threadtId, usertId);

    // Assert
    expect(deletedComment).toStrictEqual(expectedDeletedComment);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadtId);
    expect(mockThreadRepository.getCommentById).toBeCalledWith(commentId);
    expect(mockThreadRepository.checkOwnerComment).toBeCalledWith(commentId,usertId);
    expect(mockThreadRepository.deleteComment).toBeCalledWith(commentId);
  });
});
