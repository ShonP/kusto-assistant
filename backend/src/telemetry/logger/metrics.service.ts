import { Injectable } from '@nestjs/common';
import * as opentelemetry from '@opentelemetry/api';
import {
  IMetricAttributes,
  ICounterOptions,
  IGaugeOptions,
  IHistogramOptions,
} from './interfaces/metrics.interface';

@Injectable()
export class MetricsService {
  private meter: opentelemetry.Meter;
  private counters: Map<string, opentelemetry.Counter> = new Map();
  private histograms: Map<string, opentelemetry.Histogram> = new Map();
  private gauges: Map<string, opentelemetry.ObservableGauge> = new Map();

  constructor() {
    this.meter = opentelemetry.metrics.getMeter('app-metrics');
  }

  incrementCounter(args: {
    name: string;
    value?: number;
    attributes?: IMetricAttributes;
  }): void {
    let counter = this.counters.get(args.name);

    if (!counter) {
      counter = this.meter.createCounter(args.name);
      this.counters.set(args.name, counter);
    }

    counter.add(args.value ?? 1, args.attributes);
  }

  createCounter(options: ICounterOptions): opentelemetry.Counter {
    const existing = this.counters.get(options.name);
    if (existing) {
      return existing;
    }

    const counter = this.meter.createCounter(options.name, {
      description: options.description,
      unit: options.unit,
    });

    this.counters.set(options.name, counter);
    return counter;
  }

  recordHistogram(args: {
    name: string;
    value: number;
    attributes?: IMetricAttributes;
  }): void {
    let histogram = this.histograms.get(args.name);

    if (!histogram) {
      histogram = this.meter.createHistogram(args.name);
      this.histograms.set(args.name, histogram);
    }

    histogram.record(args.value, args.attributes);
  }

  createHistogram(options: IHistogramOptions): opentelemetry.Histogram {
    const existing = this.histograms.get(options.name);
    if (existing) {
      return existing;
    }

    const histogram = this.meter.createHistogram(options.name, {
      description: options.description,
      unit: options.unit,
    });

    this.histograms.set(options.name, histogram);
    return histogram;
  }

  createGauge(args: {
    options: IGaugeOptions;
    callback: (observableResult: opentelemetry.ObservableResult) => void;
  }): opentelemetry.ObservableGauge {
    const existing = this.gauges.get(args.options.name);
    if (existing) {
      return existing;
    }

    const gauge = this.meter.createObservableGauge(args.options.name, {
      description: args.options.description,
      unit: args.options.unit,
    });

    gauge.addCallback(args.callback);
    this.gauges.set(args.options.name, gauge);

    return gauge;
  }

  recordDuration(args: {
    name: string;
    startTime: number;
    attributes?: IMetricAttributes;
  }): void {
    const duration = Date.now() - args.startTime;
    this.recordHistogram({
      name: args.name,
      value: duration,
      attributes: args.attributes,
    });
  }
}
