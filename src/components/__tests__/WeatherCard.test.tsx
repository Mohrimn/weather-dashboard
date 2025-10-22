import { render, screen } from '@testing-library/react';
import WeatherCard from '../WeatherCard';
import type { UnifiedCurrentConditions } from '@/types/unifiedWeather';

describe('WeatherCard', () => {
  const baseData: UnifiedCurrentConditions = {
    timestamp: '2024-01-01T12:00:00Z',
    temperature: 20,
    humidity: 60,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 180,
    precipitation: 0,
    cloudCover: 20
  };

  it('renders weather metrics for provider', () => {
    render(
      <WeatherCard
        provider="OpenMeteo"
        data={baseData}
        fromCache
        rateLimited={false}
      />
    );

    expect(screen.getByText('OpenMeteo')).toBeInTheDocument();
    expect(screen.getByText('20.0°C')).toBeInTheDocument();
    expect(screen.getByText('0.0mm')).toBeInTheDocument();
    expect(screen.getByText('5.0m/s')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('1013hPa')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Cached')).toBeInTheDocument();
  });

  it('renders error state when provided', () => {
    render(
      <WeatherCard
        provider="OpenWeatherMap"
        error="Failed to load"
      />
    );

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('OpenWeatherMap')).toBeInTheDocument();
  });
});
