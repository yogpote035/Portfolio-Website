import config from 'dotenv';
config.config();
import app from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection } from './config/db.js';

async function bootstrap() {
  try {
    await testDatabaseConnection();
    app.listen(env.port, () => {
      console.log(`Portfolio CMS API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start API server:', error.message);
    process.exit(1);
  }
}

bootstrap();
