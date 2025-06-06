# Weather Comparison Dashboard

A modern weather dashboard that compares weather data from multiple providers for a specific location. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- Real-time weather data comparison from multiple providers:
  - OpenWeatherMap
  - Open-Meteo
- 7-day weather forecast
- Interactive charts and visualizations
- Responsive design
- API call rate limiting and caching

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- API keys for weather services

## Environment Variables

Create a `.env.local` file in the `apps/weather` directory with the following variables:

```env
# OpenWeatherMap API Key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here

# Location Configuration
NEXT_PUBLIC_WEATHER_POSTAL_CODE=your_postal_code
NEXT_PUBLIC_WEATHER_COUNTRY=your_country_code
```

### API Keys

1. **OpenWeatherMap API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your API key from your account dashboard
   - Free tier includes 60 calls/minute

2. **Open-Meteo**
   - No API key required
   - Free to use with no rate limits

## Installation

1. Clone the repository
2. Navigate to the weather app directory:
   ```bash
   cd apps/weather
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create the `.env.local` file with your configuration
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

The dashboard will automatically:
- Fetch current weather data from both providers
- Display 7-day forecasts
- Update data every 5 minutes
- Cache responses for 30 minutes
- Limit API calls to 50 per day

### Data Refresh

- Current weather data refreshes every 5 minutes
- Forecast data is cached for 30 minutes
- API calls are limited to 50 per day to stay within free tier limits
- When API limit is reached, the app will use cached data

## Technical Details

### API Rate Limiting

The app implements a client-side rate limiting system:
- Maximum 50 API calls per day
- Counter resets at midnight
- Uses localStorage to track call counts
- Gracefully falls back to cached data when limit is reached

### Caching

- Weather data is cached for 30 minutes
- Separate caches for current weather and forecasts
- Separate caches for each provider
- Cache is stored in localStorage

### Data Providers

1. **OpenWeatherMap**
   - Current weather data
   - 5-day/3-hour forecast
   - Requires API key
   - Free tier available

2. **Open-Meteo**
   - Current weather data
   - 7-day forecast
   - No API key required
   - No rate limits


