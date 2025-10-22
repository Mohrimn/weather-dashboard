'use client';

import type { UnifiedLocation } from '@/types/unifiedWeather';

interface FavoritesPanelProps {
  favorites: UnifiedLocation[];
  selectedLocations: UnifiedLocation[];
  maxSelections: number;
  onSelect: (location: UnifiedLocation) => void;
  onRemove: (locationId: string) => void;
}

export const FavoritesPanel = ({ favorites, selectedLocations, maxSelections, onSelect, onRemove }: FavoritesPanelProps) => {
  const selectedIds = new Set(selectedLocations.map((location) => location.id));
  const disableAdditionalSelection = selectedLocations.length >= maxSelections;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Favorites</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{favorites.length} saved</span>
      </div>
      {favorites.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Save locations to quickly compare them.
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((location) => {
            const isSelected = selectedIds.has(location.id);
            const disableSelection = disableAdditionalSelection && !isSelected;

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
                    onClick={() => onRemove(location.id)}
                    className="px-3 py-1 rounded text-sm border border-red-300 text-red-600 dark:border-red-700 dark:text-red-300"
                  >
                    Remove
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
