import dotenv from 'dotenv';
dotenv.config();

export async function getHealthStatus() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

export async function getReadinessStatus() {
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasApiKey = !!process.env.CAPTCHA_PROVIDER_API_KEY;

  return {
    application: 'ready',
    telegramStatus: hasToken ? 'configured' : 'missing_token',
    providerStatus: hasApiKey ? 'configured' : 'missing_api_key',
  };
}
