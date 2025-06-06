import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';

// Mock the useWeatherData hook
jest.mock('../../hooks/useWeatherData', () => ({
  useWeatherData: () => ({
    currentData: [
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
    ],
    forecastData: [
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
    ],
    isLoading: false,
    error: null
  })
}));

describe('Page', () => {
  it('renders weather dashboard', async () => {
    render(<Page />);

    // Check if title is displayed
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();

    // Check if weather cards are rendered
    await waitFor(() => {
      expect(screen.getByText('OpenMeteo')).toBeInTheDocument();
    });

    // Check if charts are rendered
    expect(screen.getByText('Current Weather Comparison')).toBeInTheDocument();
    expect(screen.getByText('Temperature Forecast')).toBeInTheDocument();
    expect(screen.getByText('Precipitation Forecast Comparison')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    // Mock loading state
    jest.spyOn(require('../../hooks/useWeatherData'), 'useWeatherData').mockReturnValue({
      currentData: [],
      forecastData: [],
      isLoading: true,
      error: null
    });

    render(<Page />);

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Mock error state
    jest.spyOn(require('../../hooks/useWeatherData'), 'useWeatherData').mockReturnValue({
      currentData: [],
      forecastData: [],
      isLoading: false,
      error: 'Failed to fetch weather data'
    });

    render(<Page />);

    expect(screen.getByText('Error: Failed to fetch weather data')).toBeInTheDocument();
  });

  it('displays API limit error', () => {
    // Mock API limit error
    jest.spyOn(require('../../hooks/useWeatherData'), 'useWeatherData').mockReturnValue({
      currentData: [],
      forecastData: [],
      isLoading: false,
      error: 'API call limit reached'
    });

    render(<Page />);

    expect(screen.getByText('API call limit reached. Please try again later.')).toBeInTheDocument();
  });
}); 