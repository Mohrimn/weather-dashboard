import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartDataPoint, CurrentWeatherChartData, PrecipitationChartData } from '../utils/weatherDataTransformers';

interface WeatherChartProps {
  title: string;
  type: 'line' | 'bar';
  data: ChartDataPoint[] | CurrentWeatherChartData[] | PrecipitationChartData[];
  className?: string;
}

export const WeatherChart = ({ title, type, data, className = '' }: WeatherChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
      </div>
    );
  }
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            console.log('line data', data),
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />  
                   <Line type="monotone" dataKey="minTemp" stroke="#0088fe" name="Min Temperature (°C)" />
                   <Line type="monotone" dataKey="maxTemp" stroke="#ff7300" name="Max Temperature (°C)" />
            </LineChart>
          ) : (
            console.log('bar data', data),
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="OpenMeteo" fill="#8884d8" name="OpenMeteo (mm)" />
              <Bar dataKey="OpenWeatherMap" fill="#82ca9d" name="OpenWeather (mm)" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 