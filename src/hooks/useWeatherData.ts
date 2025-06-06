import { useState, useEffect } from 'react';
import { WeatherData, WeatherForecast } from '../types/weather';
import { fetchAllWeatherData, fetchForecast } from '../services/weatherService';

interface UseWeatherDataReturn {
  currentData: WeatherData[];
  forecastData: WeatherForecast[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWeatherData = (): UseWeatherDataReturn => {
  const [currentData, setCurrentData] = useState<WeatherData[]>([]);
  const [forecastData, setForecastData] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [weatherData, openMeteoForecast, openWeatherForecast] = await Promise.all([
        fetchAllWeatherData(),
        fetchForecast('OpenMeteo'),
        fetchForecast('OpenWeatherMap')
      ]);
      setCurrentData(weatherData);
      setForecastData([...openMeteoForecast, ...openWeatherForecast]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    currentData,
    forecastData,
    loading,
    error,
    refetch: fetchData
  };
}; 