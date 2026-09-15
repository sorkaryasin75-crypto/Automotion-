import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { getHealthStatus, getReadinessStatus } from './health.js';
import { handleWebhook } from './webhook.js';
import { startRuntimeCleanup, stopRuntimeCleanup } from '../runtime/cleanup.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || '';
  const method = req.method || 'GET';

  if (method === 'GET' && url === '/health') {
    const health = await getHealthStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
    return;
  }

  if (method === 'GET' && url === '/ready') {
    const readiness = await getReadinessStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readiness));
    return;
  }

  if (method === 'POST' && url === '/telegram/webhook') {
    await handleWebhook(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  logger.info('SERVER_STARTED', `Telegram Human Worker Platform running on port ${PORT}`);
  startRuntimeCleanup();
});

// Graceful Shutdown Implementation
function gracefulShutdown(signal: string) {
  logger.info('SHUTDOWN_INITIATED', `Received ${signal}. Performing graceful shutdown...`);
  stopRuntimeCleanup();
  server.close(() => {
    logger.info('SERVER_CLOSED', 'HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('FORCED_SHUTDOWN', 'Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
