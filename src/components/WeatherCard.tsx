import { WeatherData } from '../types/weather';
import { format } from 'date-fns';
import { WiDaySunny, WiRain, WiStrongWind, WiHumidity, WiBarometer, WiCloudy } from 'react-icons/wi';

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{data.provider}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(data.timestamp), 'HH:mm')}
        </span>
      </div>
      
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
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{data.precipitation}mm</p>
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
    </div>
  );
}; 