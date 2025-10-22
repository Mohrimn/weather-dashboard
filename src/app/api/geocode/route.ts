import { NextResponse } from 'next/server';
import type { UnifiedLocation } from '@/types/unifiedWeather';

interface GeocodeApiResult {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }

    const data = await response.json();
    const results: UnifiedLocation[] = (data.results ?? []).map((result: GeocodeApiResult) => ({
      id: String(result.id ?? `${result.latitude.toFixed(3)}:${result.longitude.toFixed(3)}`),
      name: result.name,
      admin1: result.admin1,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Failed to fetch geocode data', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
