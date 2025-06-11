'use client';

import { useState, useEffect } from 'react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { WeatherChart } from './WeatherChart';
import { useWeatherData } from '../hooks/useWeatherData';
import { WeatherData, WeatherForecast } from '../types/weather';

interface DateRange {
  start: Date;
  end: Date;
}

interface Statistics {
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  rainyDays: number;
  stdDevTemperature: number;
}

const calculateStatistics = (data: WeatherData[][]): Statistics => {
  const allTemperatures = data.flatMap(dayData => 
    dayData.map(reading => reading.temperature)
  );
  
  const allPrecipitations = data.flatMap(dayData => 
    dayData.map(reading => reading.precipitation)
  );

  const avgTemperature = allTemperatures.reduce((a, b) => a + b, 0) / allTemperatures.length;
  const minTemperature = Math.min(...allTemperatures);
  const maxTemperature = Math.max(...allTemperatures);
  
  // Calculate standard deviation
  const squareDiffs = allTemperatures.map(value => {
    const diff = value - avgTemperature;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const stdDevTemperature = Math.sqrt(avgSquareDiff);

  // Count days with precipitation > 0.1mm
  const rainyDays = allPrecipitations.filter(precip => precip > 0.1).length;

  return {
    avgTemperature,
    minTemperature,
    maxTemperature,
    rainyDays,
    stdDevTemperature
  };
};

const transformHistoricalData = (data: WeatherData[][]): any[] => {
  const dailyAverages = data.map(dayData => {
    const avgTemp = dayData.reduce((sum, reading) => sum + reading.temperature, 0) / dayData.length;
    const avgPrecip = dayData.reduce((sum, reading) => sum + reading.precipitation, 0) / dayData.length;
    const avgWind = dayData.reduce((sum, reading) => sum + reading.windSpeed, 0) / dayData.length;
    
    return {
      date: format(parseISO(dayData[0].timestamp), 'MMM dd'),
      temperature: Number(avgTemp.toFixed(1)),
      precipitation: Number(avgPrecip.toFixed(1)),
      windSpeed: Number(avgWind.toFixed(1))
    };
  });

  return dailyAverages;
};

const compareWithCurrent = (
  currentData: WeatherData[],
  forecastData: WeatherForecast[],
  historicalStats: Statistics
): { today: string; forecast: string } => {
  const currentAvgTemp = currentData.reduce((sum, data) => sum + data.temperature, 0) / currentData.length;
  const tempDiff = currentAvgTemp - historicalStats.avgTemperature;
  
  const forecastAvgTemp = forecastData
    .slice(0, 7) // Next 7 days
    .reduce((sum, data) => sum + (data.maxTemperature + data.minTemperature) / 2, 0) / 7;
  const forecastDiff = forecastAvgTemp - historicalStats.avgTemperature;

  return {
    today: `${tempDiff > 0 ? '+' : ''}${tempDiff.toFixed(1)}°C`,
    forecast: `${forecastDiff > 0 ? '+' : ''}${forecastDiff.toFixed(1)}°C`
  };
};

export const HistoricalDataView = () => {
  const { historicalData, fetchHistoricalData, currentData, forecastData } = useWeatherData();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [comparison, setComparison] = useState<{ today: string; forecast: string } | null>(null);

  useEffect(() => {
    fetchHistoricalData(dateRange.start, dateRange.end);
  }, [dateRange, fetchHistoricalData]);

  useEffect(() => {
    if (historicalData.current.length > 0) {
      setStatistics(calculateStatistics(historicalData.current));
    }
  }, [historicalData]);

  useEffect(() => {
    if (statistics && currentData.length > 0 && forecastData.length > 0) {
      setComparison(compareWithCurrent(currentData, forecastData, statistics));
    }
  }, [statistics, currentData, forecastData]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Historical Data</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange(new Date(e.target.value), dateRange.end)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange(dateRange.start, new Date(e.target.value))}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Historical Chart */}
      {historicalData.current.length > 0 && (
        <WeatherChart
          title="Historical Temperature"
          type="line"
          data={transformHistoricalData(historicalData.current)}
          className="mb-8"
        />
      )}

      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Average Temperature</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.avgTemperature.toFixed(1)}°C
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Temperature Range</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.minTemperature.toFixed(1)}°C - {statistics.maxTemperature.toFixed(1)}°C
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Rainy Days</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.rainyDays}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Temperature Variation</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ±{statistics.stdDevTemperature.toFixed(1)}°C
            </p>
          </div>
        </div>
      )}

      {/* Comparison Panel */}
      {comparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Comparison with Current Weather</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Today vs Historical Average</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {comparison.today} compared to historical average
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Next 7 Days vs Historical Average</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {comparison.forecast} compared to historical average
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 