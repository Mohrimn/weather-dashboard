import axios from 'axios';
import { WeatherData, WeatherForecast } from '../types/weather';

const POSTAL_CODE = process.env.NEXT_PUBLIC_WEATHER_POSTAL_CODE;
const COUNTRY = process.env.NEXT_PUBLIC_WEATHER_COUNTRY;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_DAILY_CALLS = 50;

interface CacheData {
  timestamp: number;
  data: any;
}

interface DailyCallCount {
  date: string;
  count: number;
}

const getCacheKey = (type: 'current' | 'forecast', provider: string) => `weather_${type}_${provider}`;
const getDailyCallsKey = () => `weather_daily_calls_${new Date().toISOString().split('T')[0]}`;

const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { timestamp, data }: CacheData = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }

  return data as T;
};

const setCachedData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  
  const cacheData: CacheData = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
};

const incrementDailyCalls = (): boolean => {
  if (typeof window === 'undefined') return true;

  const today = new Date().toISOString().split('T')[0];
  const key = getDailyCallsKey();
  const cached = localStorage.getItem(key);
  
  let dailyCalls: DailyCallCount;
  if (cached) {
    dailyCalls = JSON.parse(cached);
    if (dailyCalls.date !== today) {
      dailyCalls = { date: today, count: 0 };
    }
  } else {
    dailyCalls = { date: today, count: 0 };
  }

  if (dailyCalls.count >= MAX_DAILY_CALLS) {
    return false;
  }

  dailyCalls.count++;
  localStorage.setItem(key, JSON.stringify(dailyCalls));
  return true;
};

// DWD API (German Weather Service via Bright Sky)
// This implementation fetches coordinates for the configured postal code and
// then retrieves the current weather data from the Bright Sky API which
// exposes measurements from the German Weather Service (DWD).
const fetchDWDData = async (): Promise<WeatherData> => {
  const cacheKey = getCacheKey('current', 'DWD');
  const cached = getCachedData<WeatherData>(cacheKey);
  if (cached) return cached;

  if (!incrementDailyCalls()) {
    throw new Error('Daily API call limit reached');
  }

  // Resolve coordinates for the given postal code.
  const geoResponse = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${POSTAL_CODE}&country=${COUNTRY}&language=en&format=json`
  );

  const location = geoResponse.data.results?.[0];
  if (!location) {
    throw new Error('Location not found');
  }

  // Query Bright Sky for the latest measurements at the resolved coordinates.
  const weatherResponse = await axios.get(
    `https://api.brightsky.dev/current_weather?lat=${location.latitude}&lon=${location.longitude}`
  );

  const current = weatherResponse.data.weather?.[0];
  if (!current) {
    throw new Error('Weather data not available');
  }

  const data: WeatherData = {
    timestamp: current.timestamp,
    temperature: current.temperature,
    humidity: current.relative_humidity,
    pressure: current.pressure_msl,
    windSpeed: current.wind_speed,
    windDirection: current.wind_direction,
    precipitation: current.precipitation,
    cloudCover: current.cloud_cover,
    provider: 'DWD'
  };

  setCachedData(cacheKey, data);
  return data;
};

// OpenWeatherMap API
const fetchOpenWeatherData = async (): Promise<WeatherData> => {
  const cacheKey = getCacheKey('current', 'OpenWeatherMap');
  const cached = getCachedData<WeatherData>(cacheKey);
  if (cached) return cached;

  if (!incrementDailyCalls()) {
    throw new Error('Daily API call limit reached');
  }

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!API_KEY) throw new Error('OpenWeather API key not found');

  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?zip=${POSTAL_CODE},${COUNTRY}&appid=${API_KEY}&units=metric`
  );

  const data: WeatherData = {
    timestamp: new Date().toISOString(),
    temperature: response.data.main.temp,
    humidity: response.data.main.humidity,
    pressure: response.data.main.pressure,
    windSpeed: response.data.wind.speed,
    windDirection: response.data.wind.deg,
    precipitation: response.data.rain?.['1h'] || 0,
    cloudCover: response.data.clouds.all,
    provider: 'OpenWeatherMap'
  };

  setCachedData(cacheKey, data);
  return data;
};

// Open-Meteo API
const fetchOpenMeteoData = async (): Promise<WeatherData> => {
  const cacheKey = getCacheKey('current', 'OpenMeteo');
  const cached = getCachedData<WeatherData>(cacheKey);
  if (cached) return cached;

  if (!incrementDailyCalls()) {
    throw new Error('Daily API call limit reached');
  }

  // First, get coordinates for the postal code
  const geoResponse = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${POSTAL_CODE}&country=${COUNTRY}&language=en&format=json`
  );

  const location = geoResponse.data.results[0];
  if (!location) {
    throw new Error('Location not found');
  }

  // Then get weather data for the coordinates
  const weatherResponse = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover&timezone=auto`
  );

  const current = weatherResponse.data.current;
  const data: WeatherData = {
    timestamp: current.time,
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    pressure: current.pressure_msl,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    cloudCover: current.cloud_cover,
    provider: 'OpenMeteo'
  };

  setCachedData(cacheKey, data);
  return data;
};

export const fetchAllWeatherData = async (): Promise<WeatherData[]> => {
  try {
    const [openWeatherData, openMeteoData] = await Promise.all([
      fetchOpenWeatherData(),
      fetchOpenMeteoData()
    ]);

    return [openWeatherData, openMeteoData];
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const fetchForecast = async (provider: 'OpenWeatherMap' | 'OpenMeteo'): Promise<WeatherForecast[]> => {
  const cacheKey = getCacheKey('forecast', provider);
  const cached = getCachedData<WeatherForecast[]>(cacheKey);
  if (cached) return cached;

  if (!incrementDailyCalls()) {
    throw new Error('Daily API call limit reached');
  }

  if (provider === 'OpenMeteo') {
    // First, get coordinates for the postal code
    const geoResponse = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${POSTAL_CODE}&country=${COUNTRY}&language=en&format=json`
    );

    const location = geoResponse.data.results[0];
    if (!location) {
      throw new Error('Location not found');
    }

    // Get 7-day forecast data
    const forecastResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`
    );

    const daily = forecastResponse.data.daily;
    const data = daily.time.map((time: string, index: number) => ({
      date: time,
      maxTemperature: daily.temperature_2m_max[index],
      minTemperature: daily.temperature_2m_min[index],
      precipitationProbability: daily.precipitation_probability_max[index],
      precipitationAmount: daily.precipitation_sum[index],
      windSpeed: daily.wind_speed_10m_max[index],
      windDirection: daily.wind_direction_10m_dominant[index],
      provider: 'OpenMeteo'
    }));

    setCachedData(cacheKey, data);
    return data;
  } else {
    // OpenWeatherMap forecast
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!API_KEY) throw new Error('OpenWeather API key not found');

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?zip=${POSTAL_CODE},${COUNTRY}&appid=${API_KEY}&units=metric`
    );

    // Group forecast by day and calculate daily statistics
    const dailyForecasts = response.data.list.reduce((acc: any, item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = {
          temps: [],
          precipitations: [],
          windSpeeds: [],
          windDirections: [],
          precipitationProbabilities: []
        };
      }
      acc[date].temps.push(item.main.temp);
      acc[date].precipitations.push(item.rain?.['3h'] || 0);
      acc[date].windSpeeds.push(item.wind.speed);
      acc[date].windDirections.push(item.wind.deg);
      acc[date].precipitationProbabilities.push(item.pop * 100); // Convert to percentage
      return acc;
    }, {});

    const data = Object.entries(dailyForecasts).map(([date, data]: [string, any]) => ({
      date,
      maxTemperature: Math.max(...data.temps),
      minTemperature: Math.min(...data.temps),
      precipitationProbability: Math.max(...data.precipitationProbabilities),
      precipitationAmount: data.precipitations.reduce((a: number, b: number) => a + b, 0),
      windSpeed: Math.max(...data.windSpeeds),
      windDirection: data.windDirections[Math.floor(data.windDirections.length / 2)], // Use middle value as dominant
      provider: 'OpenWeatherMap' as const
    }));

    setCachedData(cacheKey, data);
    return data;
  }
}; 