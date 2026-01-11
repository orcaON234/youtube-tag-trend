
export interface DataPoint {
  date: string;
  count: number;
}

export interface SeriesData {
  tag: string;
  data: DataPoint[];
  peakDate: string;
  growthPercentage: string;
  totalCount: number;
}

export interface TrendResponse {
  series: SeriesData[];
}

export type LogicMode = 'NONE' | 'OR' | 'AND' | 'NOT';

export interface TimeRange {
  startYear: number;
  endYear: number;
}
