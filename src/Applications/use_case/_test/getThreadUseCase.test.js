const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add trhead action correctly', async () => {
    // Arrange
  
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

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    const fakeAuthenticationTokenManager = {
      decodePayload: () => {
        return Promise.resolve({ id: usertId });
      },
    };

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(expectedThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: fakeAuthenticationTokenManager,
    });

    // Action
    const thread = await getThreadUseCase.execute(threadtId);

    // Assert
    expect(thread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadtId);
  });
});
