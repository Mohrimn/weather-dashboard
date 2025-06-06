import axios from 'axios';
import {
  fetchOpenMeteoData,
  fetchOpenWeatherMapData,
  fetchAllWeatherData,
  fetchForecast
} from '../weatherService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('weatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOpenMeteoData', () => {
    const mockGeocodingResponse = {
      data: {
        results: [{
          latitude: 50.5,
          longitude: 8.5
        }]
      }
    };

    const mockWeatherResponse = {
      data: {
        current: {
          temperature_2m: 20,
          relative_humidity_2m: 60,
          pressure_msl: 1013,
          wind_speed_10m: 5,
          wind_direction_10m: 180,
          precipitation: 0,
          cloud_cover: 20
        }
      }
    };

    it('fetches weather data from Open-Meteo', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockGeocodingResponse)
        .mockResolvedValueOnce(mockWeatherResponse);

      const result = await fetchOpenMeteoData('35516', 'DE');

      expect(result).toEqual({
        timestamp: expect.any(String),
        temperature: 20,
        humidity: 60,
        pressure: 1013,
        windSpeed: 5,
        windDirection: 180,
        precipitation: 0,
        cloudCover: 20,
        provider: 'OpenMeteo'
      });
    });

    it('handles geocoding errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Geocoding failed'));

      await expect(fetchOpenMeteoData('35516', 'DE')).rejects.toThrow('Failed to fetch weather data from Open-Meteo');
    });
  });

  describe('fetchOpenWeatherMapData', () => {
    const mockResponse = {
      data: {
        main: {
          temp: 293.15,
          humidity: 60,
          pressure: 1013
        },
        wind: {
          speed: 5,
          deg: 180
        },
        rain: { '1h': 0 },
        clouds: { all: 20 }
      }
    };

    it('fetches weather data from OpenWeatherMap', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchOpenWeatherMapData('35516', 'DE');

      expect(result).toEqual({
        timestamp: expect.any(String),
        temperature: 20,
        humidity: 60,
        pressure: 1013,
        windSpeed: 5,
        windDirection: 180,
        precipitation: 0,
        cloudCover: 20,
        provider: 'OpenWeatherMap'
      });
    });

    it('handles API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API failed'));

      await expect(fetchOpenWeatherMapData('35516', 'DE')).rejects.toThrow('Failed to fetch weather data from OpenWeatherMap');
    });
  });

  describe('fetchAllWeatherData', () => {
    it('fetches data from all providers', async () => {
      const mockOpenMeteoData = {
        timestamp: '2024-01-01T12:00:00Z',
        temperature: 20,
        humidity: 60,
        pressure: 1013,
        windSpeed: 5,
        windDirection: 180,
        precipitation: 0,
        cloudCover: 20,
        provider: 'OpenMeteo'
      };

      const mockOpenWeatherMapData = {
        timestamp: '2024-01-01T12:00:00Z',
        temperature: 21,
        humidity: 65,
        pressure: 1012,
        windSpeed: 6,
        windDirection: 185,
        precipitation: 0.5,
        cloudCover: 25,
        provider: 'OpenWeatherMap'
      };

      jest.spyOn(global, 'fetch').mockImplementation((url) => {
        if (url.includes('open-meteo')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOpenMeteoData)
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOpenWeatherMapData)
        } as Response);
      });

      const result = await fetchAllWeatherData('35516', 'DE');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(mockOpenMeteoData);
      expect(result).toContainEqual(mockOpenWeatherMapData);
    });
  });

  describe('fetchForecast', () => {
    it('fetches forecast data from Open-Meteo', async () => {
      const mockResponse = {
        data: {
          daily: {
            time: ['2024-01-01', '2024-01-02'],
            temperature_2m_max: [22, 23],
            temperature_2m_min: [15, 16],
            precipitation_probability_max: [20, 25],
            precipitation_sum: [0.5, 0.7],
            wind_speed_10m_max: [5, 6],
            wind_direction_10m_dominant: [180, 185]
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchForecast('35516', 'DE', 'OpenMeteo');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        maxTemperature: 22,
        minTemperature: 15,
        precipitationProbability: 20,
        precipitationAmount: 0.5,
        windSpeed: 5,
        windDirection: 180,
        provider: 'OpenMeteo'
      });
    });

    it('fetches forecast data from OpenWeatherMap', async () => {
      const mockResponse = {
        data: {
          list: [
            {
              dt_txt: '2024-01-01 12:00:00',
              main: {
                temp_max: 295.15,
                temp_min: 288.15
              },
              pop: 0.2,
              rain: { '3h': 0.5 },
              wind: {
                speed: 5,
                deg: 180
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchForecast('35516', 'DE', 'OpenWeatherMap');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        maxTemperature: 22,
        minTemperature: 15,
        precipitationProbability: 20,
        precipitationAmount: 0.5,
        windSpeed: 5,
        windDirection: 180,
        provider: 'OpenWeatherMap'
      });
    });
  });
}); 