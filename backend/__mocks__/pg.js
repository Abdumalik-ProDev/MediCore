const mockQuery = global.__mockQuery || jest.fn().mockResolvedValue({ rows: [] });

const mPool = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue({
    query: mockQuery,
    release: jest.fn(),
  }),
  on: jest.fn(),
};

class Pool {
  constructor() {
    return mPool;
  }
}

module.exports = { Pool };
