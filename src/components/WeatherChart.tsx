'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from 'next-themes';
import { ChartDataPoint, PrecipitationChartData } from '@/utils/weatherDataTransformers';

interface WeatherChartProps {
  title: string;
  type: 'line' | 'bar';
  data: ChartDataPoint[] | PrecipitationChartData[];
  className?: string;
}

const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export const WeatherChart = ({ title, type, data, className = '' }: WeatherChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#e5e7eb' : '#374151';
  const gridColor = isDark ? '#4b5563' : '#e5e7eb';
  const backgroundColor = isDark ? '#1f2937' : '#ffffff';

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
      </div>
    );
  }

  const barSeriesKeys =
    type === 'bar'
      ? Array.from(
          new Set(
            (data as PrecipitationChartData[]).flatMap((item) =>
              Object.keys(item).filter((key) => key !== 'date')
            )
          )
        )
      : [];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data as ChartDataPoint[]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis stroke={textColor} tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor,
                  border: `1px solid ${gridColor}`,
                  color: textColor
                }}
              />
              <Legend wrapperStyle={{ color: textColor }} />
              <Line type="monotone" dataKey="minTemp" stroke="#0088fe" name="Min Temperature (°C)" />
              <Line type="monotone" dataKey="maxTemp" stroke="#ff7300" name="Max Temperature (°C)" />
            </LineChart>
          ) : (
            <BarChart data={data as PrecipitationChartData[]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis stroke={textColor} tick={{ fill: textColor }} />
              <Tooltip
                contentStyle={{
                  backgroundColor,
                  border: `1px solid ${gridColor}`,
                  color: textColor
                }}
              />
              <Legend wrapperStyle={{ color: textColor }} />
              {barSeriesKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={BAR_COLORS[index % BAR_COLORS.length]} name={`${key} (mm)`} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherChart;
