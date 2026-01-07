/**
 * Simple structured logging utility
 * In production, logs are minimized and can be sent to external services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

type LogHandler = (entry: LogEntry) => void;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;
  private handlers: LogHandler[] = [];

  constructor(level?: LogLevel) {
    // Use provided level or default based on environment
    this.minLevel = level ?? (import.meta.env.PROD ? 'warn' : 'debug');

    // Default console handler
    this.addHandler(this.consoleHandler.bind(this));
  }

  private consoleHandler(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, context ?? '');
        break;
      case 'info':
        console.info(prefix, message, context ?? '');
        break;
      case 'warn':
        console.warn(prefix, message, context ?? '');
        break;
      case 'error':
        console.error(prefix, message, context ?? '');
        break;
    }
  }

  addHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: LogHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.handlers.forEach((handler) => {
      try {
        handler(entry);
      } catch (e) {
        console.error('Log handler error:', e);
      }
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}

// Singleton logger instance
export const logger = new Logger();

// Convenience exports
export const { debug, info, warn, error } = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
};

export type { LogLevel, LogEntry, LogHandler };
