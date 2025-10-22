'use client';

import type { UnifiedLocation } from '@/types/unifiedWeather';

interface CompareBarProps {
  locations: UnifiedLocation[];
  maxSelections: number;
  onRemove: (id: string) => void;
}

export const CompareBar = ({ locations, maxSelections, onRemove }: CompareBarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Selected Locations ({locations.length}/{maxSelections})
        </h2>
        {locations.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Search for a city to begin comparing weather providers.
          </p>
        )}
        {locations.map((location) => (
          <span
            key={location.id}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
          >
            {location.name}, {location.country}
            <button
              type="button"
              onClick={() => onRemove(location.id)}
              className="text-blue-700 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
              aria-label={`Remove ${location.name} from comparison`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
