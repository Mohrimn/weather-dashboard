import { DailyRateLimiter } from '../rateLimiter';

describe('DailyRateLimiter', () => {
  it('enforces limits per provider', () => {
    const limiter = new DailyRateLimiter(2);
    expect(limiter.canConsume('OpenWeatherMap')).toBe(true);
    limiter.consume('OpenWeatherMap');
    expect(limiter.getRemaining('OpenWeatherMap')).toBe(1);
    limiter.consume('OpenWeatherMap');
    expect(limiter.canConsume('OpenWeatherMap')).toBe(false);
    expect(() => limiter.consume('OpenWeatherMap')).toThrow('Rate limit reached');
  });

  it('resets counters on new day', () => {
    jest.useFakeTimers();
    const limiter = new DailyRateLimiter(1);

    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    expect(limiter.canConsume('OpenMeteo')).toBe(true);
    limiter.consume('OpenMeteo');
    expect(limiter.canConsume('OpenMeteo')).toBe(false);

    jest.setSystemTime(new Date('2024-01-02T00:00:00Z'));
    expect(limiter.canConsume('OpenMeteo')).toBe(true);
    jest.useRealTimers();
  });
});
