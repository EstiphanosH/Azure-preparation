export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface StructuredLogRecord {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly correlationId: string;
  readonly payload?: unknown;
}

// Redaction patterns
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
const TOKEN_REGEX = /(?:tok-[a-zA-Z0-9_-]+|bearer\s+[a-zA-Z0-9._-]+|jwt-[a-zA-Z0-9._-]+)/gi;
const SENSITIVE_KEY_REGEX = /(?:password|token|secret|answer|selected_?index)/i;


export function redactSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    let sanitized = data.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    sanitized = sanitized.replace(TOKEN_REGEX, '[REDACTED_TOKEN]');
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        copy[key] = '[REDACTED_SENSITIVE]';
      } else {
        copy[key] = redactSensitiveData(value);
      }
    }
    return copy;
  }

  return data;
}

export class StructuredLogger {
  private logSink: (serializedJson: string) => void;

  constructor(sink?: (serializedJson: string) => void) {
    this.logSink = sink || ((json) => console.log(json));
  }

  public log(level: LogLevel, message: string, correlationId: string, payload?: unknown): string {
    const sanitizedPayload = payload ? redactSensitiveData(payload) : undefined;
    const sanitizedMessage = typeof message === 'string' ? (redactSensitiveData(message) as string) : message;

    const record: StructuredLogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      correlationId,
      payload: sanitizedPayload,
    };

    const serialized = JSON.stringify(record);
    this.logSink(serialized);
    return serialized;
  }

  public info(message: string, correlationId: string, payload?: unknown): string {
    return this.log('INFO', message, correlationId, payload);
  }

  public warn(message: string, correlationId: string, payload?: unknown): string {
    return this.log('WARN', message, correlationId, payload);
  }

  public error(message: string, correlationId: string, payload?: unknown): string {
    return this.log('ERROR', message, correlationId, payload);
  }
}

export const logger = new StructuredLogger();
