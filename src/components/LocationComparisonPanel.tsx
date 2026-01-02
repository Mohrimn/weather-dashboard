'use client';

import type {
  UnifiedCurrentResponse,
  UnifiedForecastResponse,
  UnifiedLocation
} from '@/types/unifiedWeather';
import { WeatherCard } from '@/components/WeatherCard';
import { WeatherChart } from '@/components/WeatherChart';
import { LocationOverviewCard } from '@/components/LocationOverviewCard';
import {
  transformForecastToChartData,
  transformPrecipitationData
} from '@/utils/weatherDataTransformers';

interface LocationComparisonPanelProps {
  location: UnifiedLocation;
  currentData?: UnifiedCurrentResponse;
  forecastData?: UnifiedForecastResponse;
  error?: string | null;
  isLoading?: boolean;
}

export const LocationComparisonPanel = ({
  location,
  currentData,
  forecastData,
  error,
  isLoading = false
}: LocationComparisonPanelProps) => {
  const precipitationData = forecastData
    ? transformPrecipitationData(forecastData.providers)
    : [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.1),transparent_60%)]" />
      <div className="relative space-y-6">
        <LocationOverviewCard
          location={location}
          current={currentData}
          error={error}
          isLoading={isLoading}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Current conditions
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Live readings from each provider.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {currentData?.providers?.map((provider) => (
                <WeatherCard
                  key={provider.provider}
                  provider={provider.provider}
                  data={provider.data}
                  fromCache={provider.fromCache}
                  rateLimited={provider.rateLimited}
                  error={provider.error}
                />
              ))}
              {!currentData?.providers?.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Current conditions will appear once data is available.
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Forecast comparison
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                7-day temperature outlook for each provider.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {forecastData?.providers?.map((provider) => (
                <div key={provider.provider}>
                  {provider.error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
                      {provider.error}
                    </div>
                  ) : (
                    <WeatherChart
                      title={`${provider.provider} Temperature Forecast`}
                      type="line"
                      data={provider.data ? transformForecastToChartData(provider.data) : []}
                      className="border border-slate-200/80 dark:border-slate-800"
                    />
                  )}
                </div>
              ))}
              {!forecastData?.providers?.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Forecast charts will appear once data is available.
                </div>
              )}
            </div>
          </div>
        </div>

        {precipitationData.length > 0 && (
          <WeatherChart
            title="Precipitation Forecast Comparison"
            type="bar"
            data={precipitationData}
            className="border border-slate-200/80 dark:border-slate-800"
          />
        )}
      </div>
    </section>
  );
};
