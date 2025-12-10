/**
 * Agent Event Types
 * These are the events streamed to the client via SSE
 */

export type AgentMode = 'autocomplete' | 'execute';

export interface AgentEvent {
  type:
    | 'annotation'
    | 'tool_call'
    | 'tool_result'
    | 'query_preview'
    | 'query_result'
    | 'chart_data'
    | 'message'
    | 'error'
    | 'done';
  title: string;
  description: string;
  data?: unknown;
  timestamp: string;
}

export interface AnnotationEvent extends AgentEvent {
  type: 'annotation';
}

export interface ToolCallEvent extends AgentEvent {
  type: 'tool_call';
  data: {
    tool: string;
    args: Record<string, unknown>;
  };
}

export interface ToolResultEvent extends AgentEvent {
  type: 'tool_result';
  data: {
    tool: string;
    result: unknown;
  };
}

export interface QueryPreviewEvent extends AgentEvent {
  type: 'query_preview';
  data: {
    query: string;
    isComplete: boolean;
  };
}

export interface QueryResultEvent extends AgentEvent {
  type: 'query_result';
  data: {
    query: string;
    columns: Array<{ name: string; type: string }>;
    rows: Array<Record<string, unknown>>;
    rowCount: number;
  };
}

export interface ChartDataEvent extends AgentEvent {
  type: 'chart_data';
  data: {
    chartType: 'bar' | 'pie' | 'line';
    labels: string[];
    values: number[];
    title: string;
  };
}

export interface MessageEvent extends AgentEvent {
  type: 'message';
  data: {
    content: string;
  };
}

export interface ErrorEvent extends AgentEvent {
  type: 'error';
  data: {
    error: string;
  };
}

export interface DoneEvent extends AgentEvent {
  type: 'done';
  data: {
    finalAnswer: string;
  };
}

export type AgentStreamEvent =
  | AnnotationEvent
  | ToolCallEvent
  | ToolResultEvent
  | QueryPreviewEvent
  | QueryResultEvent
  | ChartDataEvent
  | MessageEvent
  | ErrorEvent
  | DoneEvent;

/**
 * Create an agent event with timestamp
 */
export function createEvent<T extends AgentStreamEvent>(
  type: T['type'],
  title: string,
  description: string,
  data?: T['data'],
): T {
  return {
    type,
    title,
    description,
    data,
    timestamp: new Date().toISOString(),
  } as T;
}
