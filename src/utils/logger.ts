import dotenv from 'dotenv';
dotenv.config();

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const currentLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const levelMap: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

const activeLevel = levelMap[currentLevel] ?? LogLevel.INFO;

function sanitize(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/(TELEGRAM_BOT_TOKEN|CAPTCHA_PROVIDER_API_KEY|TELEGRAM_WEBHOOK_SECRET)=([^\s&]+)/gi, '$1=***MASKED***')
      .replace(/\b[0-9]{8,10}:[a-zA-Z0-9_-]{35}\b/g, 'BOT_TOKEN_***MASKED***');
  }
  if (typeof data === 'object' && data !== null) {
    const clone: any = Array.isArray(data) ? [] : {};
    for (const key of Object.keys(data)) {
      if (['token', 'apiKey', 'secret', 'password', 'authorization'].includes(key)) {
        clone[key] = '***MASKED***';
      } else {
        clone[key] = sanitize(data[key]);
      }
    }
    return clone;
  }
  return data;
}

export const logger = {
  debug(event: string, message: string, meta?: Record<string, any>) {
    if (activeLevel <= LogLevel.DEBUG) {
      console.debug(JSON.stringify(sanitize({ timestamp: new Date().toISOString(), level: 'DEBUG', event, message, ...meta })));
    }
  },
  info(event: string, message: string, meta?: Record<string, any>) {
    if (activeLevel <= LogLevel.INFO) {
      console.log(JSON.stringify(sanitize({ timestamp: new Date().toISOString(), level: 'INFO', event, message, ...meta })));
    }
  },
  warn(event: string, message: string, meta?: Record<string, any>) {
    if (activeLevel <= LogLevel.WARN) {
      console.warn(JSON.stringify(sanitize({ timestamp: new Date().toISOString(), level: 'WARN', event, message, ...meta })));
    }
  },
  error(event: string, message: string, meta?: Record<string, any>) {
    if (activeLevel <= LogLevel.ERROR) {
      console.error(JSON.stringify(sanitize({ timestamp: new Date().toISOString(), level: 'ERROR', event, message, ...meta })));
    }
  }
};
