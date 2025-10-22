import { format } from 'date-fns';
import { WiDaySunny, WiRain, WiStrongWind, WiHumidity, WiBarometer, WiCloudy } from 'react-icons/wi';
import type { UnifiedCurrentConditions, WeatherProvider } from '@/types/unifiedWeather';

interface WeatherCardProps {
  provider: WeatherProvider;
  data?: UnifiedCurrentConditions;
  fromCache?: boolean;
  rateLimited?: boolean;
  error?: string;
}

export const WeatherCard = ({ provider, data, fromCache, rateLimited, error }: WeatherCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{provider}</h2>
          {data && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(data.timestamp), 'PPpp')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {fromCache && (
            <span className="text-xs font-semibold uppercase text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded">
              Cached
            </span>
          )}
          {rateLimited && (
            <span className="text-xs font-semibold uppercase text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded">
              Rate limited
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <WiDaySunny className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.temperature.toFixed(1)}°C</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <WiRain className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Precipitation</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.precipitation.toFixed(1)}mm</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <WiStrongWind className="w-8 h-8 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.windSpeed.toFixed(1)}m/s</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <WiHumidity className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <WiBarometer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.pressure}hPa</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <WiCloudy className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cloud Cover</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.cloudCover}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">No data available</div>
      )}
    </div>
  );
};

export default WeatherCard;
