import { render, screen } from '@testing-library/react';
import WeatherCard from '../WeatherCard';

describe('WeatherCard', () => {
  const mockWeatherData = {
    provider: 'OpenMeteo',
    temperature: 20,
    humidity: 60,
    windSpeed: 5,
    precipitation: 0,
    pressure: 1013,
    cloudCover: 20
  };

  it('renders weather card with all data', () => {
    render(<WeatherCard {...mockWeatherData} />);
    
    // Check if provider name is displayed
    expect(screen.getByText('OpenMeteo')).toBeInTheDocument();
    
    // Check if temperature is displayed
    expect(screen.getByText('20°C')).toBeInTheDocument();
    
    // Check if other weather metrics are displayed
    expect(screen.getByText('60%')).toBeInTheDocument(); // Humidity
    expect(screen.getByText('5 m/s')).toBeInTheDocument(); // Wind Speed
    expect(screen.getByText('0 mm')).toBeInTheDocument(); // Precipitation
    expect(screen.getByText('1013 hPa')).toBeInTheDocument(); // Pressure
    expect(screen.getByText('20%')).toBeInTheDocument(); // Cloud Cover
  });

  it('renders weather card with missing optional data', () => {
    const minimalData = {
      provider: 'OpenMeteo',
      temperature: 20,
      humidity: 60,
      windSpeed: 5,
      precipitation: 0
    };

    render(<WeatherCard {...minimalData} />);
    
    // Check if required data is displayed
    expect(screen.getByText('OpenMeteo')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    
    // Check if optional data is not displayed
    expect(screen.queryByText('hPa')).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
}); 