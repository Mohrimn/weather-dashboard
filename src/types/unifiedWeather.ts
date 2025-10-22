export type WeatherProvider = 'OpenWeatherMap' | 'OpenMeteo';

export interface UnifiedLocation {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface UnifiedCurrentConditions {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
}

export interface UnifiedCurrentProviderData {
  provider: WeatherProvider;
  fromCache: boolean;
  rateLimited: boolean;
  data?: UnifiedCurrentConditions;
  error?: string;
}

export interface UnifiedCurrentResponse {
  location: UnifiedLocation;
  providers: UnifiedCurrentProviderData[];
}

export interface UnifiedForecastDay {
  date: string;
  maxTemperature: number;
  minTemperature: number;
  precipitationProbability: number;
  precipitationAmount: number;
  windSpeed: number;
  windDirection: number;
}

export interface UnifiedForecastProviderData {
  provider: WeatherProvider;
  fromCache: boolean;
  rateLimited: boolean;
  data?: UnifiedForecastDay[];
  error?: string;
}

export interface UnifiedForecastResponse {
  location: UnifiedLocation;
  providers: UnifiedForecastProviderData[];
}
