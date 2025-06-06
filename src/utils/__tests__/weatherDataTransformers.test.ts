import { WeatherData, WeatherForecast } from '../../types/weather';
import {
  transformCurrentWeatherData,
  transformForecastData,
  transformForecastToChartData,
  transformPrecipitationData
} from '../weatherDataTransformers';

describe('weatherDataTransformers', () => {
  const mockWeatherData: WeatherData[] = [
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
    },
    {
      timestamp: '2024-01-01T12:00:00Z',
      temperature: 21,
      humidity: 65,
      pressure: 1012,
      windSpeed: 6,
      windDirection: 185,
      precipitation: 0.5,
      cloudCover: 25,
      provider: 'OpenWeatherMap'
    }
  ];

  const mockForecastData: WeatherForecast[] = [
    {
      date: '2024-01-01',
      maxTemperature: 22,
      minTemperature: 15,
      precipitationProbability: 20,
      precipitationAmount: 0.5,
      windSpeed: 5,
      windDirection: 180,
      provider: 'OpenMeteo'
    },
    {
      date: '2024-01-01',
      maxTemperature: 23,
      minTemperature: 16,
      precipitationProbability: 25,
      precipitationAmount: 0.7,
      windSpeed: 6,
      windDirection: 185,
      provider: 'OpenWeatherMap'
    }
  ];

  describe('transformCurrentWeatherData', () => {
    it('should transform current weather data correctly', () => {
      const result = transformCurrentWeatherData(mockWeatherData);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        provider: 'OpenMeteo',
        temperature: 20,
        humidity: 60,
        windSpeed: 5,
        precipitation: 0
      });
    });
  });

  describe('transformForecastData', () => {
    it('should group forecast data by provider', () => {
      const result = transformForecastData(mockForecastData);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result.OpenMeteo).toHaveLength(1);
      expect(result.OpenWeatherMap).toHaveLength(1);
    });
  });

  describe('transformForecastToChartData', () => {
    it('should transform forecast data to chart format', () => {
      const result = transformForecastToChartData(mockForecastData);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: 'Jan 01',
        maxTemp: 22,
        minTemp: 15
      });
    });
  });

  describe('transformPrecipitationData', () => {
    it('should transform precipitation data correctly', () => {
      const result = transformPrecipitationData(mockForecastData);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: 'Jan 01',
        OpenMeteo: 0.5,
        OpenWeatherMap: 0.7
      });
    });
  });
}); 