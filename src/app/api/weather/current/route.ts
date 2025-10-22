import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeOpenMeteoCurrent,
  normalizeOpenWeatherCurrent
} from '@/server/normalize';
import { buildCacheKey, weatherCache } from '@/server/cache';
import { weatherRateLimiter } from '@/server/rateLimiter';
import type {
  UnifiedCurrentProviderData,
  UnifiedCurrentResponse,
  UnifiedLocation,
  WeatherProvider
} from '@/types/unifiedWeather';

const WEATHER_PROVIDERS: WeatherProvider[] = ['OpenWeatherMap', 'OpenMeteo'];

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

async function fetchProviderData(
  provider: WeatherProvider,
  location: UnifiedLocation
): Promise<{ status: number; payload: UnifiedCurrentProviderData }> {
  const cacheKey = buildCacheKey('current', provider, location.latitude, location.longitude);
  const canConsume = weatherRateLimiter.canConsume(provider);
  const cached = weatherCache.get<UnifiedCurrentProviderData['data']>(cacheKey);

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
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeatherMap request failed with status ${response.status}`);
      }

      const json = await response.json();
      const normalized = normalizeOpenWeatherCurrent(json);
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
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover&timezone=${encodeURIComponent(location.timezone ?? 'auto')}`
    );

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    const json = await response.json();
    const normalized = normalizeOpenMeteoCurrent(json);
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
    console.error(`Failed to fetch ${provider} current weather`, error);
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

  const response: UnifiedCurrentResponse = {
    location,
    providers: providerResponses.map((result) => result.payload)
  };

  return NextResponse.json(response, { status });
}
