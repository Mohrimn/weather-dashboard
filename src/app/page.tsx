'use client';

import { useWeatherData } from '../hooks/useWeatherData';
import { WeatherCard } from '../components/WeatherCard';
import { WeatherChart } from '../components/WeatherChart';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  transformCurrentWeatherData,
  transformForecastData,
  transformForecastToChartData,
  transformPrecipitationData
} from '../utils/weatherDataTransformers';

export default function WeatherDashboard() {
  const { currentData, forecastData, loading, error } = useWeatherData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <ThemeToggle />
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <p className="font-semibold">Error: {error}</p>
            {error.includes('Daily API call limit reached') && (
              <p className="mt-2 text-sm">
                We've reached the daily limit for weather API calls. The data will be refreshed automatically when the limit resets.
                In the meantime, you can still view the last cached weather data.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentChartData = transformCurrentWeatherData(currentData);
  const forecastByProvider = transformForecastData(forecastData);
  const precipitationData = transformPrecipitationData(forecastData);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Weather Dashboard</h1>
        
        {/* Current Weather Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentData.map((data) => (
            <WeatherCard key={data.provider} data={data} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Temperature Forecast Charts by Provider */}
          {Object.entries(forecastByProvider).map(([provider, forecasts]) => (
            <WeatherChart
              key={provider}
              title={`${provider} Temperature Forecast`}
              type="line"
              data={transformForecastToChartData(forecasts)}
              className="mb-8"
            />
          ))}
        </div>

        {/* Precipitation Forecast Comparison */}
        <WeatherChart
          title="Precipitation Forecast Comparison"
          type="bar"
          data={precipitationData}
        />
      </div>
    </div>
  );
}
