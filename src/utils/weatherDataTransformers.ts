import { WeatherData, WeatherForecast } from '../types/weather';
import { format } from 'date-fns';

export interface ChartDataPoint {
  date: string;
  maxTemp: number;
  minTemp: number;
}

export interface CurrentWeatherChartData {
  provider: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface PrecipitationChartData {
  date: string;
  [key: string]: string | number;
}

export const transformCurrentWeatherData = (data: WeatherData[]): CurrentWeatherChartData[] => {
  return data.map(item => ({
    provider: item.provider,
    temperature: item.temperature,
    humidity: item.humidity,
    windSpeed: item.windSpeed,
    precipitation: item.precipitation,
  }));
};

export const transformForecastData = (forecasts: WeatherForecast[]): Record<string, WeatherForecast[]> => {
  return forecasts.reduce((acc, forecast) => {
    if (!acc[forecast.provider]) acc[forecast.provider] = [];
    acc[forecast.provider].push(forecast);
    return acc;
  }, {} as Record<string, WeatherForecast[]>);
};

export const transformForecastToChartData = (forecasts: WeatherForecast[]): ChartDataPoint[] => {
  return forecasts.map(forecast => ({
    date: format(new Date(forecast.date), 'MMM dd'),
    maxTemp: forecast.maxTemperature,
    minTemp: forecast.minTemperature,
  }));
};

export const transformPrecipitationData = (forecasts: WeatherForecast[]): PrecipitationChartData[] => {
  return forecasts.reduce((acc: PrecipitationChartData[], forecast) => {
    const date = format(new Date(forecast.date), 'MMM dd');
    const existingDay = acc.find(item => item.date === date);
    
    if (existingDay) {
      existingDay[forecast.provider] = forecast.precipitationAmount;
    } else {
      acc.push({
        date,
        [forecast.provider]: forecast.precipitationAmount,
      });
    }
    return acc;
  }, []);
}; 