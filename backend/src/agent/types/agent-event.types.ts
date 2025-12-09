/**
 * Agent Event Types
 * These are the events streamed to the client via SSE
 */

export interface AgentEvent {
  type:
    | 'annotation'
    | 'tool_call'
    | 'tool_result'
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
