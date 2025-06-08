import { useState, useEffect } from 'react';
import { WeatherData, WeatherForecast } from '../types/weather';
import { fetchAllWeatherData, fetchForecast } from '../services/weatherService';
import { historicalDataService } from '../services/historicalDataService';

interface UseWeatherDataReturn {
  currentData: WeatherData[];
  forecastData: WeatherForecast[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  historicalData: {
    current: WeatherData[][];
    forecast: WeatherForecast[][];
  };
  fetchHistoricalData: (startDate: Date, endDate: Date) => Promise<void>;
}

export const useWeatherData = (): UseWeatherDataReturn => {
  const [currentData, setCurrentData] = useState<WeatherData[]>([]);
  const [forecastData, setForecastData] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<{
    current: WeatherData[][];
    forecast: WeatherForecast[][];
  }>({ current: [], forecast: [] });

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
      
      // Store data in IndexedDB
      await Promise.all([
        historicalDataService.storeCurrentWeather(weatherData),
        historicalDataService.storeForecast([...openMeteoForecast, ...openWeatherForecast])
      ]);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (startDate: Date, endDate: Date) => {
    try {
      const [historicalCurrent, historicalForecast] = await Promise.all([
        historicalDataService.getHistoricalCurrentWeather(startDate, endDate),
        historicalDataService.getHistoricalForecast(startDate, endDate)
      ]);

      setHistoricalData({
        current: historicalCurrent,
        forecast: historicalForecast
      });
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    
    // Clean up old data every day
    const cleanupInterval = setInterval(() => {
      historicalDataService.clearOldData(30); // Keep 30 days of data
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);

  return {
    currentData,
    forecastData,
    loading,
    error,
    refetch: fetchData,
    historicalData,
    fetchHistoricalData
  };
}; 