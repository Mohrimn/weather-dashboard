import { UnifiedCurrentConditions, UnifiedForecastDay } from '@/types/unifiedWeather';

type OpenWeatherCurrentResponse = {
  dt: number;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
  };
  clouds?: {
    all: number;
  };
};

type OpenMeteoCurrentResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
    cloud_cover: number;
  };
};

type OpenWeatherForecastResponse = {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    rain?: {
      '3h'?: number;
    };
    pop: number;
  }>;
};

type OpenMeteoForecastResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
};

export const normalizeOpenWeatherCurrent = (data: OpenWeatherCurrentResponse): UnifiedCurrentConditions => ({
  timestamp: new Date(data.dt * 1000).toISOString(),
  temperature: data.main.temp,
  humidity: data.main.humidity,
  pressure: data.main.pressure,
  windSpeed: data.wind.speed,
  windDirection: data.wind.deg,
  precipitation: data.rain?.['1h'] ?? 0,
  cloudCover: data.clouds?.all ?? 0
});

export const normalizeOpenMeteoCurrent = (data: OpenMeteoCurrentResponse): UnifiedCurrentConditions => ({
  timestamp: data.current.time,
  temperature: data.current.temperature_2m,
  humidity: data.current.relative_humidity_2m,
  pressure: data.current.pressure_msl,
  windSpeed: data.current.wind_speed_10m,
  windDirection: data.current.wind_direction_10m,
  precipitation: data.current.precipitation,
  cloudCover: data.current.cloud_cover
});

export const normalizeOpenWeatherForecast = (data: OpenWeatherForecastResponse): UnifiedForecastDay[] => {
  const grouped = data.list.reduce<Record<string, {
    temps: number[];
    precipitation: number[];
    precipitationProbability: number[];
    windSpeeds: number[];
    windDirections: number[];
  }>>((acc, entry) => {
    const date = entry.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = {
        temps: [],
        precipitation: [],
        precipitationProbability: [],
        windSpeeds: [],
        windDirections: []
      };
    }

    acc[date].temps.push(entry.main.temp);
    acc[date].precipitation.push(entry.rain?.['3h'] ?? 0);
    acc[date].precipitationProbability.push(entry.pop * 100);
    acc[date].windSpeeds.push(entry.wind.speed);
    acc[date].windDirections.push(entry.wind.deg);
    return acc;
  }, {});

  return Object.entries(grouped).map(([date, values]) => {
    const dominantWindIndex = Math.floor(values.windDirections.length / 2);
    return {
      date,
      maxTemperature: Math.max(...values.temps),
      minTemperature: Math.min(...values.temps),
      precipitationProbability: Math.max(...values.precipitationProbability),
      precipitationAmount: values.precipitation.reduce((sum, value) => sum + value, 0),
      windSpeed: Math.max(...values.windSpeeds),
      windDirection: values.windDirections[dominantWindIndex] ?? 0
    };
  });
};

export const normalizeOpenMeteoForecast = (data: OpenMeteoForecastResponse): UnifiedForecastDay[] =>
  data.daily.time.map((time, index) => ({
    date: time,
    maxTemperature: data.daily.temperature_2m_max[index],
    minTemperature: data.daily.temperature_2m_min[index],
    precipitationProbability: data.daily.precipitation_probability_max[index],
    precipitationAmount: data.daily.precipitation_sum[index],
    windSpeed: data.daily.wind_speed_10m_max[index],
    windDirection: data.daily.wind_direction_10m_dominant[index]
  }));
