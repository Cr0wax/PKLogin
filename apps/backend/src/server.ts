import 'dotenv/config';

import { env } from './config/env.js';
import { logError, logEvent } from './lib/logger.js';
import { createApp } from './app.js';
import { initializeDataStore } from './storage/db.js';

async function start(): Promise<void> {
  try {
    await initializeDataStore();

    const app = createApp();
    app.listen(env.PORT, () => {
      logEvent('server_started', {
        port: env.PORT,
        environment: env.NODE_ENV,
      });
    });
  } catch (error) {
    logError('startup_failed', error);
    process.exit(1);
  }
}

void start();
