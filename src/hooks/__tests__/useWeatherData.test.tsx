import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherData } from '../useWeatherData';
import { fetchAllWeatherData, fetchForecast } from '../../services/weatherService';

// Mock the weather service
jest.mock('../../services/weatherService', () => ({
  fetchAllWeatherData: jest.fn(),
  fetchForecast: jest.fn(),
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
      provider: 'OpenMeteo',
    },
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
      provider: 'OpenMeteo',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchAllWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);
    (fetchForecast as jest.Mock).mockImplementation((provider) => {
      if (provider === 'OpenMeteo') {
        return Promise.resolve(mockForecastData);
      } else if (provider === 'OpenWeatherMap') {
        return Promise.resolve(mockForecastData);
      }
      return Promise.resolve([]);
    });
  });

  it('fetches initial weather data', async () => {
    const { result } = renderHook(() => useWeatherData());

    // Initial state
    expect(result.current.currentData).toEqual([]);
    expect(result.current.forecastData).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for data to be fetched
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.currentData).toEqual(mockWeatherData);
      expect(result.current.forecastData).toEqual([
        ...mockForecastData,
        ...mockForecastData,
      ]);
      expect(result.current.error).toBeNull();
    });
  });

  it('handles API errors', async () => {
    const error = new Error('API Error');
    (fetchAllWeatherData as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useWeatherData());

    // Wait for error to be caught
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('API Error');
    });
  });

  it('refreshes data periodically', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useWeatherData());

    // Initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Advance timer by 5 minutes
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Check if data was refreshed
    await waitFor(() => {
      expect(fetchAllWeatherData).toHaveBeenCalledTimes(2);
    });
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderHook(() => useWeatherData());

    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});