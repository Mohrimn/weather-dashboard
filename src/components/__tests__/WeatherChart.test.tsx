import { render, screen } from '@testing-library/react';
import { WeatherChart } from '../WeatherChart';

describe('WeatherChart', () => {
  const mockLineChartData = [
    { date: 'Jan 01', maxTemp: 22, minTemp: 15 },
    { date: 'Jan 02', maxTemp: 23, minTemp: 16 }
  ];

  const mockBarChartData = [
    { date: 'Jan 01', OpenMeteo: 0.5, OpenWeatherMap: 0.7 },
    { date: 'Jan 02', OpenMeteo: 0.3, OpenWeatherMap: 0.4 }
  ];

  it('renders line chart with temperature data', () => {
    render(<WeatherChart type="line" data={mockLineChartData} title="Temperature Forecast" />);

    expect(screen.getByText('Temperature Forecast')).toBeInTheDocument();
  });

  it('renders bar chart with precipitation data', () => {
    render(<WeatherChart type="bar" data={mockBarChartData} title="Precipitation Forecast" />);

    expect(screen.getByText('Precipitation Forecast')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<WeatherChart type="line" data={[]} title="No Data" />);

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
