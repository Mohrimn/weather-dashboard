import { renderHook, act } from '@testing-library/react';
import { useWeatherData } from '../useWeatherData';

// Mock the weather service
jest.mock('../../services/weatherService', () => ({
  fetchAllWeatherData: jest.fn(),
  fetchForecast: jest.fn()
}));

describe('useWeatherData', () => {
  const mockWeatherData = [
    {
      timestamp: '2024-01-01T12:00:00Z',
      temperature: 20,
      humidity: 60,
      pressure: 1013,
      windSpeed: 5,
      windDirection: 180,
      precipitation: 0,
      cloudCover: 20,
      provider: 'OpenMeteo'
    }
  ];

  const mockForecastData = [
    {
      date: '2024-01-01',
      maxTemperature: 22,
      minTemperature: 15,
      precipitationProbability: 20,
      precipitationAmount: 0.5,
      windSpeed: 5,
      windDirection: 180,
      provider: 'OpenMeteo'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches initial weather data', async () => {
    const { result } = renderHook(() => useWeatherData('35516', 'DE'));

    // Initial state
    expect(result.current.currentData).toEqual([]);
    expect(result.current.forecastData).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for data to be fetched
    await act(async () => {
      await Promise.resolve();
    });

    // Check if data was fetched
    expect(result.current.currentData).toEqual(mockWeatherData);
    expect(result.current.forecastData).toEqual(mockForecastData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    const error = new Error('API Error');
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(error);

    const { result } = renderHook(() => useWeatherData('35516', 'DE'));

    // Wait for error to be caught
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe('Failed to fetch weather data');
    expect(result.current.isLoading).toBe(false);
  });

  it('refreshes data periodically', async () => {
    const { result } = renderHook(() => useWeatherData('35516', 'DE'));

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });

    // Advance timer by 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Check if data was refreshed
    expect(result.current.currentData).toEqual(mockWeatherData);
    expect(result.current.forecastData).toEqual(mockForecastData);
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderHook(() => useWeatherData('35516', 'DE'));
    
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
}); 