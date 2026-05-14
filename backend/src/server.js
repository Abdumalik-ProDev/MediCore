const app = require('./app');
const config = require('./common/config/env');
const logger = require('./common/config/logger');
const runMigrations = require('./common/database/migrate');

async function start() {
  try {
    await runMigrations();
    app.listen(config.port, () => {
      logger.info(`MRMS API running on port ${config.port}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
