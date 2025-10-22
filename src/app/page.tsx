'use client';

import { useEffect, useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchLocation } from '@/components/SearchLocation';
import { FavoritesPanel } from '@/components/FavoritesPanel';
import { CompareBar } from '@/components/CompareBar';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherChart } from '@/components/WeatherChart';
import { useUnifiedWeather } from '@/hooks/useUnifiedWeather';
import {
  transformForecastToChartData,
  transformPrecipitationData
} from '@/utils/weatherDataTransformers';
import type { UnifiedLocation } from '@/types/unifiedWeather';

const MAX_LOCATIONS = 3;
const FAVORITES_KEY = 'weather:favorites';
const SELECTION_KEY = 'weather:selected';

type StoredLocation = Omit<UnifiedLocation, 'id'> & { id: string };

const parseStoredLocations = (value: string | null): UnifiedLocation[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed: StoredLocation[] = JSON.parse(value);
    return parsed.map((item) => ({ ...item }));
  } catch (error) {
    console.warn('Failed to parse stored locations', error);
    return [];
  }
};

const storeLocations = (key: string, locations: UnifiedLocation[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(locations));
};

const locationExists = (collection: UnifiedLocation[], location: UnifiedLocation) =>
  collection.some((item) => item.id === location.id);

export default function WeatherDashboard() {
  const [favorites, setFavorites] = useState<UnifiedLocation[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<UnifiedLocation[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setFavorites(parseStoredLocations(localStorage.getItem(FAVORITES_KEY)));
    setSelectedLocations(parseStoredLocations(localStorage.getItem(SELECTION_KEY)));
  }, []);

  useEffect(() => {
    storeLocations(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    storeLocations(SELECTION_KEY, selectedLocations);
  }, [selectedLocations]);

  const { current, forecast, loading, errors, rateLimited, refetch } = useUnifiedWeather(selectedLocations);

  const handleSelectLocation = (location: UnifiedLocation) => {
    setSelectedLocations((prev) => {
      if (locationExists(prev, location)) {
        return prev;
      }
      if (prev.length >= MAX_LOCATIONS) {
        return prev;
      }
      return [...prev, location];
    });
  };

  const handleRemoveLocation = (id: string) => {
    setSelectedLocations((prev) => prev.filter((location) => location.id !== id));
  };

  const handleToggleFavorite = (location: UnifiedLocation) => {
    setFavorites((prev) => {
      if (locationExists(prev, location)) {
        return prev.filter((item) => item.id !== location.id);
      }
      return [...prev, location];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((favorite) => favorite.id !== id));
  };

  const anyErrors = useMemo(() => Object.values(errors).filter(Boolean).length > 0, [errors]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 sm:p-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Compare OpenWeatherMap and Open-Meteo for up to three locations.
            </p>
          </div>
          {selectedLocations.length > 0 && (
            <button
              type="button"
              onClick={refetch}
              className="self-start sm:self-auto inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              Refresh data
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="space-y-6">
            <SearchLocation
              favorites={favorites}
              selectedLocations={selectedLocations}
              maxSelections={MAX_LOCATIONS}
              onSelect={handleSelectLocation}
              onToggleFavorite={handleToggleFavorite}
            />
            <FavoritesPanel
              favorites={favorites}
              selectedLocations={selectedLocations}
              maxSelections={MAX_LOCATIONS}
              onSelect={handleSelectLocation}
              onRemove={handleRemoveFavorite}
            />
          </div>

          <div>
            <CompareBar locations={selectedLocations} maxSelections={MAX_LOCATIONS} onRemove={handleRemoveLocation} />

            {rateLimited && (
              <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
                Daily API limit reached for at least one provider. Showing cached data when available.
              </div>
            )}

            {loading && selectedLocations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {selectedLocations.map((location) => (
                  <div key={location.id} className="space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : selectedLocations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                Select a city from the search results or your favorites to see the comparison.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {selectedLocations.map((location) => {
                  const currentData = current[location.id];
                  const forecastData = forecast[location.id];
                  const locationError = errors[location.id];
                  const precipitationData = forecastData
                    ? transformPrecipitationData(forecastData.providers)
                    : [];

                  return (
                    <div key={location.id} className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {location.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {location.admin1 ? `${location.admin1}, ` : ''}
                              {location.country}
                            </p>
                          </div>
                        </div>
                        {locationError && (
                          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{locationError}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        {currentData?.providers.map((provider) => (
                          <WeatherCard
                            key={provider.provider}
                            provider={provider.provider}
                            data={provider.data}
                            fromCache={provider.fromCache}
                            rateLimited={provider.rateLimited}
                            error={provider.error}
                          />
                        ))}
                      </div>

                      <div className="space-y-4">
                        {forecastData?.providers.map((provider) => (
                          <div key={provider.provider}>
                            {provider.error ? (
                              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-sm text-red-600 dark:text-red-400">
                                {provider.error}
                              </div>
                            ) : (
                              <WeatherChart
                                title={`${provider.provider} Temperature Forecast`}
                                type="line"
                                data={provider.data ? transformForecastToChartData(provider.data) : []}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {precipitationData.length > 0 && (
                        <WeatherChart
                          title="Precipitation Forecast Comparison"
                          type="bar"
                          data={precipitationData}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {anyErrors && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            Some data could not be loaded. Cached or partial results are displayed when possible.
          </div>
        )}
      </div>
    </div>
  );
}
