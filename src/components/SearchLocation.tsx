'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UnifiedLocation } from '@/types/unifiedWeather';

interface SearchLocationProps {
  favorites: UnifiedLocation[];
  selectedLocations: UnifiedLocation[];
  maxSelections: number;
  onSelect: (location: UnifiedLocation) => void;
  onToggleFavorite: (location: UnifiedLocation) => void;
}

export const SearchLocation = ({
  favorites,
  selectedLocations,
  maxSelections,
  onSelect,
  onToggleFavorite
}: SearchLocationProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to search locations');
        }

        setResults(data.results ?? []);
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to search locations');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const favoriteIds = useMemo(() => new Set(favorites.map((fav) => fav.id)), [favorites]);
  const selectedIds = useMemo(() => new Set(selectedLocations.map((location) => location.id)), [selectedLocations]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search for a city
        </label>
        <input
          id="city"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter city name"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>}
      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((location) => {
            const isFavorite = favoriteIds.has(location.id);
            const isSelected = selectedIds.has(location.id);
            const disableSelection = !isSelected && selectedLocations.length >= maxSelections;

            return (
              <li
                key={location.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {location.name}{' '}
                    <span className="text-gray-500 dark:text-gray-400">
                      {location.admin1 ? `${location.admin1}, ` : ''}
                      {location.country}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(location)}
                    className={`px-3 py-1 rounded text-sm border transition ${
                      isFavorite
                        ? 'border-yellow-500 text-yellow-600 dark:text-yellow-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button
                    type="button"
                    disabled={disableSelection}
                    onClick={() => onSelect(location)}
                    className={`px-3 py-1 rounded text-sm text-white ${
                      disableSelection ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Compare'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
