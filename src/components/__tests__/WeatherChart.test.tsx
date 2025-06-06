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
    render(
      <WeatherChart
        type="line"
        data={mockLineChartData}
        title="Temperature Forecast"
        xAxisKey="date"
        yAxisKey="maxTemp"
      />
    );

    // Check if chart title is displayed
    expect(screen.getByText('Temperature Forecast')).toBeInTheDocument();
    
    // Check if chart container is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders bar chart with precipitation data', () => {
    render(
      <WeatherChart
        type="bar"
        data={mockBarChartData}
        title="Precipitation Forecast"
        xAxisKey="date"
        yAxisKey="OpenMeteo"
      />
    );

    // Check if chart title is displayed
    expect(screen.getByText('Precipitation Forecast')).toBeInTheDocument();
    
    // Check if chart container is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const customHeight = 400;
    render(
      <WeatherChart
        type="line"
        data={mockLineChartData}
        title="Temperature Forecast"
        xAxisKey="date"
        yAxisKey="maxTemp"
        height={customHeight}
      />
    );

    const chartContainer = screen.getByRole('img');
    expect(chartContainer).toHaveStyle(`height: ${customHeight}px`);
  });
}); 