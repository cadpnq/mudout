
const PackageManager = require('./packages');
const SystemManager = require('./systems');
const ObjectManager = require('./objects');
const CommandManager = require('./commands');

exports.start = (config, start = true) => {
  global.config = config;

  const logger = require('./logger');
  global.logger = logger;

  logger.info('Starting engine');

  logger.info('Initializing package manager');
  let packages = new PackageManager();
  global.packages = packages;

  logger.info('Initializing system manager');
  let systems = new SystemManager();
  global.systems = systems;

  if (start) {
    systems.start();
  }

  logger.info('Initializing object manager');
  let objects = new ObjectManager();
  global.objects = objects;

  if (start) {
    objects.start();
  }

  logger.info('Initializing command manager');
  let commands = new CommandManager();
  global.commands = commands;

  if (start) {
    commands.start();
  }
}

exports.stop = () => {
  if (global.systems) global.systems.stop();
  if (global.objects) global.objects.stop();
  if (global.commands) global.commands.stop();
}
