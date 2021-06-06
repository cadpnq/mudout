const CommandContext = require('./CommandContext');
const Watcher = require('./../Watcher');
const misc = require('./../misc');

module.exports = class CommandManager extends Watcher {
  contexts = new Map();

  constructor() {
    super('commands');
  }

  load(path, data) {
    if (!data) {
      global.logger.info(`Loading commands: ${path}`);
      data = misc.requireReload(`./../${path}`);
    }

    let context = this.contexts.get(data.name);
    if (!context) {
      context = new CommandContext(data.name);
      this.contexts.set(data.name, context);
    }
    context.load(data);
  }
};
