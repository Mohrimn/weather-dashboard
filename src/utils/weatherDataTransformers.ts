import { format } from 'date-fns';
import { UnifiedForecastDay, UnifiedForecastProviderData } from '@/types/unifiedWeather';
import { WeatherData, WeatherForecast } from '@/types/weather';

export interface ChartDataPoint {
  date: string;
  maxTemp: number;
  minTemp: number;
}

export interface PrecipitationChartData {
  date: string;
  [key: string]: string | number;
}

export const transformCurrentWeatherData = (data: WeatherData[]) => {
  return data.map((item) => ({
    provider: item.provider,
    temperature: item.temperature,
    humidity: item.humidity,
    windSpeed: item.windSpeed,
    precipitation: item.precipitation,
  }));
};

export const transformForecastData = (data: WeatherForecast[]) => {
  const groupedByProvider: Record<string, WeatherForecast[]> = {};
  for (const item of data) {
    if (!groupedByProvider[item.provider]) {
      groupedByProvider[item.provider] = [];
    }
    groupedByProvider[item.provider].push(item);
  }
  return groupedByProvider;
};

export const transformForecastToChartData = (forecasts: UnifiedForecastDay[]): ChartDataPoint[] =>
  forecasts.map((forecast) => ({
    date: format(new Date(forecast.date), 'MMM dd'),
    maxTemp: Number(forecast.maxTemperature.toFixed(1)),
    minTemp: Number(forecast.minTemperature.toFixed(1))
  }));

export const transformPrecipitationData = (
  providers: UnifiedForecastProviderData[]
): PrecipitationChartData[] => {
  const aggregate = new Map<string, PrecipitationChartData>();

  providers.forEach((provider) => {
    if (!provider.data) {
      return;
    }

    provider.data.forEach((forecast) => {
      const date = format(new Date(forecast.date), 'MMM dd');
      if (!aggregate.has(date)) {
        aggregate.set(date, { date });
      }

      const existing = aggregate.get(date)!;
      existing[provider.provider] = Number(forecast.precipitationAmount.toFixed(2));
    });
  });

  return Array.from(aggregate.values());
};
