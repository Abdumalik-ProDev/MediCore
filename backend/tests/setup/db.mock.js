const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock('pg', () => {
  const pool = {
    query: mockQuery,
    connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => pool) };
});

afterEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [] });
});

module.exports = { mockQuery };
