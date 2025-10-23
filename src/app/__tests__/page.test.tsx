import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import type { UnifiedCurrentResponse, UnifiedForecastResponse } from '@/types/unifiedWeather';

const mockLocation = {
  id: 'loc-1',
  name: 'Berlin',
  admin1: 'Berlin',
  country: 'Germany',
  latitude: 52.52,
  longitude: 13.405
};

const currentResponse: UnifiedCurrentResponse = {
  location: mockLocation,
  providers: [
    {
      provider: 'OpenWeatherMap',
      fromCache: false,
      rateLimited: false,
      data: {
        timestamp: '2024-01-01T12:00:00Z',
        temperature: 20,
        humidity: 60,
        pressure: 1013,
        windSpeed: 5,
        windDirection: 180,
        precipitation: 0,
        cloudCover: 20
      }
    },
    {
      provider: 'OpenMeteo',
      fromCache: true,
      rateLimited: false,
      data: {
        timestamp: '2024-01-01T12:00:00Z',
        temperature: 19,
        humidity: 58,
        pressure: 1012,
        windSpeed: 4,
        windDirection: 175,
        precipitation: 0.2,
        cloudCover: 30
      }
    }
  ]
};

const forecastResponse: UnifiedForecastResponse = {
  location: mockLocation,
  providers: [
    {
      provider: 'OpenWeatherMap',
      fromCache: false,
      rateLimited: false,
      data: [
        {
          date: '2024-01-02T00:00:00.000Z',
          maxTemperature: 22,
          minTemperature: 15,
          precipitationProbability: 20,
          precipitationAmount: 0.5,
          windSpeed: 6,
          windDirection: 180
        }
      ]
    },
    {
      provider: 'OpenMeteo',
      fromCache: false,
      rateLimited: false,
      data: [
        {
          date: '2024-01-02T00:00:00.000Z',
          maxTemperature: 21,
          minTemperature: 14,
          precipitationProbability: 15,
          precipitationAmount: 0.3,
          windSpeed: 5,
          windDirection: 170
        }
      ]
    }
  ]
};

const mockUseUnifiedWeather = jest.fn();

jest.mock('@/hooks/useUnifiedWeather', () => ({
  useUnifiedWeather: (...args: unknown[]) => mockUseUnifiedWeather(...args)
}));

describe('Weather Dashboard Page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseUnifiedWeather.mockReset();
  });

  it('shows empty state when no locations are selected', async () => {
    mockUseUnifiedWeather.mockReturnValue({
      current: {},
      forecast: {},
      loading: false,
      errors: {},
      rateLimited: false,
      refetch: jest.fn()
    });

    render(<Page />);

    await waitFor(() => {
      expect(
        screen.getByText('Select a city from the search results or your favorites to see the comparison.')
      ).toBeInTheDocument();
    });
  });

  it('renders weather information for selected locations', async () => {
    localStorage.setItem('weather:selected', JSON.stringify([mockLocation]));
    mockUseUnifiedWeather.mockReturnValue({
      current: {
        [mockLocation.id]: currentResponse
      },
      forecast: {
        [mockLocation.id]: forecastResponse
      },
      loading: false,
      errors: {
        [mockLocation.id]: null
      },
      rateLimited: false,
      refetch: jest.fn()
    });

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    expect(screen.getByText('OpenWeatherMap')).toBeInTheDocument();
    expect(screen.getByText('OpenMeteo')).toBeInTheDocument();
    expect(screen.getByText('OpenWeatherMap Temperature Forecast')).toBeInTheDocument();
  });
});
