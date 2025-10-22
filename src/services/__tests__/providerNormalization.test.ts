import axios from 'axios';

import openWeatherCurrent from '../__fixtures__/openWeatherCurrent.json';
import openWeatherCurrentNoRain from '../__fixtures__/openWeatherCurrentNoRain.json';
import openMeteoGeocoding from '../__fixtures__/openMeteoGeocoding.json';
import openMeteoGeocodingEmpty from '../__fixtures__/openMeteoGeocodingEmpty.json';
import openMeteoCurrent from '../__fixtures__/openMeteoCurrent.json';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('provider normalization utilities', () => {
  let fetchAllWeatherData: typeof import('../weatherService').fetchAllWeatherData;

  const importWeatherService = async () => {
    const module = await import('../weatherService');
    fetchAllWeatherData = module.fetchAllWeatherData;
  };

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_WEATHER_POSTAL_CODE = '35516';
    process.env.NEXT_PUBLIC_WEATHER_COUNTRY = 'DE';

    await importWeatherService();
  });

  beforeEach(() => {
    mockedAxios.get.mockReset();
    localStorage.clear();
  });

  it('normalizes provider data when fixtures contain full responses', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: openWeatherCurrent })
      .mockResolvedValueOnce({ data: openMeteoGeocoding })
      .mockResolvedValueOnce({ data: openMeteoCurrent });

    const result = await fetchAllWeatherData();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        provider: 'OpenWeatherMap',
        temperature: openWeatherCurrent.main.temp,
        humidity: openWeatherCurrent.main.humidity,
        pressure: openWeatherCurrent.main.pressure,
        windSpeed: openWeatherCurrent.wind.speed,
        windDirection: openWeatherCurrent.wind.deg,
        precipitation: openWeatherCurrent.rain['1h'],
        cloudCover: openWeatherCurrent.clouds.all,
        timestamp: expect.any(String)
      }),
      expect.objectContaining({
        provider: 'OpenMeteo',
        temperature: openMeteoCurrent.current.temperature_2m,
        humidity: openMeteoCurrent.current.relative_humidity_2m,
        pressure: openMeteoCurrent.current.pressure_msl,
        windSpeed: openMeteoCurrent.current.wind_speed_10m,
        windDirection: openMeteoCurrent.current.wind_direction_10m,
        precipitation: openMeteoCurrent.current.precipitation,
        cloudCover: openMeteoCurrent.current.cloud_cover,
        timestamp: openMeteoCurrent.current.time
      })
    ]));

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    mockedAxios.get.mock.calls.forEach(([url]) => {
      expect(typeof url).toBe('string');
    });
  });

  it('defaults OpenWeatherMap precipitation to zero when rain data is missing', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: openWeatherCurrentNoRain })
      .mockResolvedValueOnce({ data: openMeteoGeocoding })
      .mockResolvedValueOnce({ data: openMeteoCurrent });

    const result = await fetchAllWeatherData();
    const openWeatherData = result.find(item => item.provider === 'OpenWeatherMap');

    expect(openWeatherData?.precipitation).toBe(0);
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  it('throws an error when Open-Meteo geocoding response has no results', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    mockedAxios.get
      .mockResolvedValueOnce({ data: openWeatherCurrent })
      .mockResolvedValueOnce({ data: openMeteoGeocodingEmpty });

    await expect(fetchAllWeatherData()).rejects.toThrow('Location not found');
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    consoleErrorSpy.mockRestore();
  });
});
