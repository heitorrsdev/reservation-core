describe('test env bootstrap', () => {
  it('should connect to test database', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
