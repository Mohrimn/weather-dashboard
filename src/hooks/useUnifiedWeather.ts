import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  UnifiedCurrentResponse,
  UnifiedForecastResponse,
  UnifiedLocation
} from '@/types/unifiedWeather';

interface UseUnifiedWeatherResult {
  current: Record<string, UnifiedCurrentResponse>;
  forecast: Record<string, UnifiedForecastResponse>;
  loading: boolean;
  errors: Record<string, string | null>;
  rateLimited: boolean;
  refetch: () => Promise<void>;
}

const buildSearchParams = (location: UnifiedLocation) => {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    name: location.name,
    country: location.country,
    id: location.id
  });

  if (location.admin1) {
    params.set('admin1', location.admin1);
  }

  if (location.timezone) {
    params.set('timezone', location.timezone);
  }

  return params;
};

export const useUnifiedWeather = (locations: UnifiedLocation[]): UseUnifiedWeatherResult => {
  const [current, setCurrent] = useState<Record<string, UnifiedCurrentResponse>>({});
  const [forecast, setForecast] = useState<Record<string, UnifiedForecastResponse>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchWeather = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;

    if (locations.length === 0) {
      if (!isMountedRef.current || fetchId !== fetchIdRef.current) {
        return;
      }
      setCurrent({});
      setForecast({});
      setErrors({});
      setRateLimited(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const responses = await Promise.all(
        locations.map(async (location) => {
          const params = buildSearchParams(location);
          const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`/api/weather/current?${params.toString()}`),
            fetch(`/api/weather/forecast?${params.toString()}`)
          ]);

          const currentJson = await currentResponse.json();
          const forecastJson = await forecastResponse.json();

          return {
            location,
            currentResponse,
            forecastResponse,
            currentJson: currentJson as UnifiedCurrentResponse & { error?: string },
            forecastJson: forecastJson as UnifiedForecastResponse & { error?: string }
          };
        })
      );

      if (!isMountedRef.current || fetchId !== fetchIdRef.current) {
        return;
      }

      const nextCurrent: Record<string, UnifiedCurrentResponse> = {};
      const nextForecast: Record<string, UnifiedForecastResponse> = {};
      const nextErrors: Record<string, string | null> = {};
      let encounteredRateLimit = false;

      responses.forEach(({ location, currentResponse, forecastResponse, currentJson, forecastJson }) => {
        nextCurrent[location.id] = currentJson;
        nextForecast[location.id] = forecastJson;

        const currentError = !currentResponse.ok && currentResponse.status !== 429 ? currentJson.error ?? 'Failed to load current weather' : null;
        const forecastError = !forecastResponse.ok && forecastResponse.status !== 429 ? forecastJson.error ?? 'Failed to load forecast' : null;

        nextErrors[location.id] = currentError ?? forecastError;

        if (
          currentResponse.status === 429 ||
          forecastResponse.status === 429 ||
          currentJson.providers?.some?.((provider) => provider.rateLimited) ||
          forecastJson.providers?.some?.((provider) => provider.rateLimited)
        ) {
          encounteredRateLimit = true;
        }
      });

      setCurrent(nextCurrent);
      setForecast(nextForecast);
      setErrors(nextErrors);
      setRateLimited(encounteredRateLimit);
    } catch (error) {
      if (!isMountedRef.current || fetchId !== fetchIdRef.current) {
        return;
      }

      const fallbackErrors: Record<string, string | null> = {};
      locations.forEach((location) => {
        fallbackErrors[location.id] = error instanceof Error ? error.message : 'Failed to fetch weather data';
      });
      setErrors(fallbackErrors);
      setRateLimited(false);
    } finally {
      if (isMountedRef.current && fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [locations]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return {
    current,
    forecast,
    loading,
    errors,
    rateLimited,
    refetch: fetchWeather
  };
};
