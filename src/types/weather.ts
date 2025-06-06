export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  provider: 'OpenWeatherMap' | 'OpenMeteo';
}

export interface WeatherForecast {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
  precipitationAmount: number;
  windSpeed: number;
  windDirection: number;
  provider: 'OpenWeatherMap' | 'OpenMeteo';
}

export interface WeatherStats {
  averageTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  totalPrecipitation: number;
  averageWindSpeed: number;
  dominantWindDirection: number;
} 