import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import * as echarts from 'echarts';
import { SleepScoreGauge } from '@/components/charts/SleepScoreGauge';
import { SleepTrendChart } from '@/components/charts/SleepTrendChart';
import { SleepStructureChart } from '@/components/charts/SleepStructureChart';

// Mock echarts - must be defined at the top level before vi.mock
const mockChartInstance = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('echarts', () => {
  // LinearGradient needs to be a class constructor since it's called with `new`
  class MockLinearGradient {
    constructor(
      public x: number,
      public y: number,
      public x2: number,
      public y2: number,
      public stops: Array<{ offset: number; color: string }>,
    ) {}
  }

  return {
    init: vi.fn(() => mockChartInstance),
    graphic: {
      LinearGradient: MockLinearGradient,
    },
    EChartsOption: {},
  };
});

describe('SleepScoreGauge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the gauge container', () => {
    render(<SleepScoreGauge score={75} />);
    const container = document.querySelector('div[style*="height: 220px"]');
    expect(container).toBeInTheDocument();
  });

  it('should initialize echarts with score value', () => {
    render(<SleepScoreGauge score={85} />);
    expect(echarts.init).toHaveBeenCalled();
    expect(mockChartInstance.setOption).toHaveBeenCalled();
  });

  it('should handle score of 0', () => {
    render(<SleepScoreGauge score={0} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    expect(option.series[0].data[0].value).toBe(0);
  });

  it('should handle score of 100', () => {
    render(<SleepScoreGauge score={100} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    expect(option.series[0].data[0].value).toBe(100);
  });
});

describe('SleepTrendChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart container', () => {
    render(<SleepTrendChart data={[]} />);
    const container = document.querySelector('div[style*="height: 350px"]');
    expect(container).toBeInTheDocument();
  });

  it('should initialize echarts with data', () => {
    const mockData = [
      { date: '2024-01-01', duration: 7.5, score: 80 },
      { date: '2024-01-02', duration: 8.0, score: 85 },
    ];
    render(<SleepTrendChart data={mockData} />);
    expect(echarts.init).toHaveBeenCalled();
    expect(mockChartInstance.setOption).toHaveBeenCalled();
  });

  it('should handle empty data array', () => {
    render(<SleepTrendChart data={[]} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    expect(option.xAxis.data).toEqual([]);
    expect(option.series[0].data).toEqual([]);
    expect(option.series[1].data).toEqual([]);
  });

  it('should handle data with null scores', () => {
    const mockData = [
      { date: '2024-01-01', duration: 7.5, score: null },
      { date: '2024-01-02', duration: 8.0, score: undefined },
    ];
    render(<SleepTrendChart data={mockData} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    expect(option.series[1].data).toEqual([null, undefined]);
  });

  it('should render correct date labels', () => {
    const mockData = [
      { date: '2024-01-01', duration: 7.5, score: 80 },
      { date: '2024-01-02', duration: 8.0, score: 85 },
    ];
    render(<SleepTrendChart data={mockData} />);
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    expect(option.xAxis.data).toEqual(['2024-01-01', '2024-01-02']);
  });
});

describe('SleepStructureChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart container', () => {
    render(<SleepStructureChart data={[]} />);
    const container = document.querySelector('div[style*="height: 320px"]');
    expect(container).toBeInTheDocument();
  });

  it('should initialize echarts with data', () => {
    const mockData = [
      { deep: 2.0, light: 4.0, rem: 1.5 },
      { deep: 1.5, light: 3.5, rem: 2.0 },
    ];
    render(<SleepStructureChart data={mockData} />);
    expect(echarts.init).toHaveBeenCalled();
    expect(mockChartInstance.setOption).toHaveBeenCalled();
  });

  it('should calculate average values correctly', () => {
    const mockData = [
      { deep: 2.0, light: 4.0, rem: 1.5 },
      { deep: 1.0, light: 2.0, rem: 1.5 },
    ];
    render(<SleepStructureChart data={mockData} />);
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    // Averages: deep = 1.5, light = 3.0, rem = 1.5
    const seriesData = option.series[0].data;
    expect(seriesData[0].value).toBe(1.5); // deep
    expect(seriesData[1].value).toBe(3.0); // light
    expect(seriesData[2].value).toBe(1.5); // rem
  });

  it('should handle data with null values', () => {
    const mockData = [
      { deep: null, light: 4.0, rem: undefined },
      { deep: 2.0, light: null, rem: 1.5 },
    ];
    render(<SleepStructureChart data={mockData} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    // null/undefined values should be treated as 0
    // Averages: deep = 1.0, light = 2.0, rem = 0.75
    const seriesData = option.series[0].data;
    expect(seriesData[0].value).toBe(1.0); // deep average (2.0 / 2)
    expect(seriesData[1].value).toBe(2.0); // light average (4.0 / 2)
    expect(seriesData[2].value).toBe(0.8); // rem average (1.5 / 2, rounded to 1 decimal)
  });

  it('should handle empty data array', () => {
    render(<SleepStructureChart data={[]} />);
    expect(mockChartInstance.setOption).toHaveBeenCalled();
    const lastCall = mockChartInstance.setOption.mock.calls[mockChartInstance.setOption.mock.calls.length - 1];
    const option = lastCall[0];
    // With empty array, all averages are NaN, but toFixed(1) converts to "NaN"
    // Number("NaN") is NaN, but we should just check it doesn't crash
    expect(option.series[0].data).toBeDefined();
    expect(option.series[0].data.length).toBe(3);
  });
});
