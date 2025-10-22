import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeOpenMeteoForecast,
  normalizeOpenWeatherForecast
} from '@/server/normalize';
import { buildCacheKey, weatherCache } from '@/server/cache';
import { weatherRateLimiter } from '@/server/rateLimiter';
import type {
  UnifiedForecastProviderData,
  UnifiedForecastResponse,
  UnifiedLocation,
  WeatherProvider
} from '@/types/unifiedWeather';

const WEATHER_PROVIDERS: WeatherProvider[] = ['OpenWeatherMap', 'OpenMeteo'];

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

async function fetchProviderData(
  provider: WeatherProvider,
  location: UnifiedLocation
): Promise<{ status: number; payload: UnifiedForecastProviderData }> {
  const cacheKey = buildCacheKey('forecast', provider, location.latitude, location.longitude);
  const canConsume = weatherRateLimiter.canConsume(provider);
  const cached = weatherCache.get<UnifiedForecastProviderData['data']>(cacheKey);

  if (!canConsume) {
    if (cached) {
      return {
        status: 429,
        payload: {
          provider,
          fromCache: true,
          rateLimited: true,
          data: cached
        }
      };
    }

    return {
      status: 429,
      payload: {
        provider,
        fromCache: false,
        rateLimited: true,
        error: 'Daily rate limit reached'
      }
    };
  }

  if (cached) {
    return {
      status: 200,
      payload: {
        provider,
        fromCache: true,
        rateLimited: false,
        data: cached
      }
    };
  }

  try {
    weatherRateLimiter.consume(provider);

    if (provider === 'OpenWeatherMap') {
      if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap forecast failed with status ${response.status}`);
      }

      const json = await response.json();
      const normalized = normalizeOpenWeatherForecast(json);
      weatherCache.set(cacheKey, normalized);

      return {
        status: 200,
        payload: {
          provider,
          fromCache: false,
          rateLimited: false,
          data: normalized
        }
      };
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=${encodeURIComponent(location.timezone ?? 'auto')}`
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo forecast failed with status ${response.status}`);
    }

    const json = await response.json();
    const normalized = normalizeOpenMeteoForecast(json);
    weatherCache.set(cacheKey, normalized);

    return {
      status: 200,
      payload: {
        provider,
        fromCache: false,
        rateLimited: false,
        data: normalized
      }
    };
  } catch (error) {
    console.error(`Failed to fetch ${provider} forecast`, error);
    return {
      status: 500,
      payload: {
        provider,
        fromCache: false,
        rateLimited: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = Number.parseFloat(searchParams.get('latitude') ?? '');
  const longitude = Number.parseFloat(searchParams.get('longitude') ?? '');
  const name = searchParams.get('name') ?? 'Unknown';
  const country = searchParams.get('country') ?? '';
  const admin1 = searchParams.get('admin1') ?? undefined;
  const timezone = searchParams.get('timezone') ?? undefined;
  const id = searchParams.get('id') ?? `${latitude},${longitude}`;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates supplied' }, { status: 400 });
  }

  const location: UnifiedLocation = {
    id,
    name,
    country,
    admin1,
    timezone,
    latitude,
    longitude
  };

  const providerResponses = await Promise.all(
    WEATHER_PROVIDERS.map(async (provider) => fetchProviderData(provider, location))
  );

  const status = providerResponses.some((result) => result.status === 429)
    ? 429
    : providerResponses.some((result) => result.status >= 500)
    ? 502
    : 200;

  const response: UnifiedForecastResponse = {
    location,
    providers: providerResponses.map((result) => result.payload)
  };

  return NextResponse.json(response, { status });
}
