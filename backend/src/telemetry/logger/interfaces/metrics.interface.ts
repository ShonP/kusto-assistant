export interface IMetricAttributes {
  [key: string]: string | number | boolean;
}

export interface ICounterOptions {
  name: string;
  description?: string;
  unit?: string;
}

export interface IGaugeOptions {
  name: string;
  description?: string;
  unit?: string;
}

export interface IHistogramOptions {
  name: string;
  description?: string;
  unit?: string;
}
