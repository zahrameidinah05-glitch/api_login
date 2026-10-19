import { SimpleLoggerMiddleware } from './simple-logger.middleware.js';

describe('SimpleLoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new SimpleLoggerMiddleware()).toBeDefined();
  });
});
