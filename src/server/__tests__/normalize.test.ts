import {
  normalizeOpenMeteoCurrent,
  normalizeOpenMeteoForecast,
  normalizeOpenWeatherCurrent,
  normalizeOpenWeatherForecast
} from '../normalize';

describe('normalize utilities', () => {
  it('normalizes OpenWeather current response', () => {
    const normalized = normalizeOpenWeatherCurrent({
      dt: 1700000000,
      main: { temp: 10, humidity: 70, pressure: 1005 },
      wind: { speed: 3, deg: 200 },
      rain: { '1h': 1 },
      clouds: { all: 50 }
    });

    expect(normalized.temperature).toBe(10);
    expect(normalized.precipitation).toBe(1);
    expect(normalized.windDirection).toBe(200);
  });

  it('normalizes Open-Meteo current response', () => {
    const normalized = normalizeOpenMeteoCurrent({
      current: {
        time: '2024-01-01T00:00:00Z',
        temperature_2m: 12,
        relative_humidity_2m: 65,
        pressure_msl: 1010,
        wind_speed_10m: 4,
        wind_direction_10m: 210,
        precipitation: 0.4,
        cloud_cover: 60
      }
    });

    expect(normalized.temperature).toBe(12);
    expect(normalized.cloudCover).toBe(60);
  });

  it('normalizes OpenWeather forecast response', () => {
    const normalized = normalizeOpenWeatherForecast({
      list: [
        {
          dt_txt: '2024-01-02 00:00:00',
          main: { temp: 10 },
          wind: { speed: 3, deg: 200 },
          rain: { '3h': 0.1 },
          pop: 0.2
        },
        {
          dt_txt: '2024-01-02 03:00:00',
          main: { temp: 12 },
          wind: { speed: 4, deg: 210 },
          rain: { '3h': 0.2 },
          pop: 0.5
        }
      ]
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0].maxTemperature).toBe(12);
    expect(normalized[0].precipitationAmount).toBeCloseTo(0.3);
    expect(normalized[0].precipitationProbability).toBe(50);
  });

  it('normalizes Open-Meteo forecast response', () => {
    const normalized = normalizeOpenMeteoForecast({
      daily: {
        time: ['2024-01-02'],
        temperature_2m_max: [15],
        temperature_2m_min: [7],
        precipitation_probability_max: [40],
        precipitation_sum: [2],
        wind_speed_10m_max: [6],
        wind_direction_10m_dominant: [190]
      }
    });

    expect(normalized[0].maxTemperature).toBe(15);
    expect(normalized[0].precipitationAmount).toBe(2);
  });
});
