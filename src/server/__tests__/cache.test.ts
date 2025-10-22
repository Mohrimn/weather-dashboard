import { TTLCache } from '../cache';

describe('TTLCache', () => {
  it('stores and retrieves values within the TTL', () => {
    const cache = new TTLCache(1000);
    cache.set('test', 'value');
    expect(cache.get<string>('test')).toBe('value');
  });

  it('expires values after TTL duration', () => {
    jest.useFakeTimers();
    const cache = new TTLCache(1000);

    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    cache.set('test', 'value');

    jest.setSystemTime(new Date('2024-01-01T00:00:02Z'));
    expect(cache.get<string>('test')).toBeUndefined();

    jest.useRealTimers();
  });
});
