'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type {
  UnifiedCurrentProviderData,
  UnifiedCurrentResponse,
  UnifiedLocation
} from '@/types/unifiedWeather';

interface LocationOverviewCardProps {
  location: UnifiedLocation;
  current?: UnifiedCurrentResponse;
  error?: string | null;
  isLoading?: boolean;
}

const formatLocalTime = (date: Date, timeZone?: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
};

const formatLocalDate = (date: Date, timeZone?: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
};

const getLatestUpdate = (providers?: UnifiedCurrentProviderData[]) => {
  if (!providers) {
    return null;
  }

  const timestamps = providers
    .map((provider) => provider.data?.timestamp)
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .map((timestamp) => new Date(timestamp))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(Math.max(...timestamps.map((date) => date.getTime())));
};

const getProviderStatus = (provider: UnifiedCurrentProviderData) => {
  if (provider.error) {
    return {
      label: 'Error',
      className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200'
    };
  }
  if (provider.rateLimited) {
    return {
      label: 'Rate limited',
      className:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/30 dark:text-amber-200'
    };
  }
  if (provider.fromCache) {
    return {
      label: 'Cached',
      className:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/30 dark:text-blue-200'
    };
  }
  if (provider.data) {
    return {
      label: 'Live',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200'
    };
  }
  return {
    label: 'Pending',
    className:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200'
  };
};

const getProviderLabel = (provider: UnifiedCurrentProviderData['provider']) => {
  if (provider === 'OpenWeatherMap') {
    return 'OpenWeather';
  }
  if (provider === 'OpenMeteo') {
    return 'Open-Meteo';
  }
  return provider;
};

export const LocationOverviewCard = ({
  location,
  current,
  error,
  isLoading = false
}: LocationOverviewCardProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeLabel = useMemo(
    () => formatLocalTime(now, location.timezone),
    [now, location.timezone]
  );
  const dateLabel = useMemo(
    () => formatLocalDate(now, location.timezone),
    [now, location.timezone]
  );
  const lastUpdated = useMemo(
    () => getLatestUpdate(current?.providers),
    [current]
  );
  const updatedRelative = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true })
    : isLoading
    ? 'Fetching latest data'
    : 'Awaiting data';
  const updatedTime = lastUpdated
    ? formatLocalTime(lastUpdated, location.timezone)
    : null;

  const providerChips = (current?.providers ?? []).map((provider) => {
    const status = getProviderStatus(provider);
    const label = getProviderLabel(provider.provider);
    return (
      <span
        key={provider.provider}
        title={provider.provider}
        className={`inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.className}`}
      >
        <span className="text-[11px] leading-none">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span className="text-[11px] leading-none">{status.label}</span>
      </span>
    );
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100/80 bg-white/90 shadow-xl shadow-sky-100/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/40">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white to-emerald-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-950/80" />
      <div className="relative space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700/80 dark:text-sky-300/80">
              Location
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {location.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {location.admin1 ? `${location.admin1}, ` : ''}
              {location.country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Local time
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{timeLabel}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{dateLabel}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Timezone
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {location.timezone ?? 'Device local time'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Last updated
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{updatedRelative}</p>
            {updatedTime && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updated at {updatedTime}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Providers
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {current?.providers?.length ?? 0} active
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status below
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {providerChips.length > 0 ? (
            providerChips
          ) : (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              Providers loading
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
