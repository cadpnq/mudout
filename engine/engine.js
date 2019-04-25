
const PackageManager = require('./packages');
const ObjectManager = require('./objects');

exports.start = (config, start = true) => {
  global.config = config;

  const logger = require('./logger');
  global.logger = logger;

  logger.info('Starting engine');

  logger.info('Initializing package manager');
  let packages = new PackageManager();
  global.packages = packages;

  logger.info('Initializing object manager');
  let objects = new ObjectManager();
  global.objects = objects;

  if (start) {
    objects.start();
  }
}

exports.stop = () => {
  global.objects.stop();
}
