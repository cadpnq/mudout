const ipc = require('node-ipc');

module.exports = function Session(extend) {
  return class session extends extend {
    socket;
    context;
    account;
    character;
    mode = 'user';
    suppressedText = new Set();

    constructor() {
      super();
      this.register('sessions');
    }

    static new(obj, socket) {
      super.new(obj);
      obj.socket = socket;
      return obj;
    }

    start() {
      this.setContext(global.config.sessionEntrypoints[this.mode]);
    }

    exec(comand) {
      if (this.context) {
        this.context.exec(this, command);
      }
    }

    emit(name, data) {
      if (this.socket) {
        ipc.server.emit(this.socket, name, data);
      }
    }

    text(mode, text) {
      if (!this.suppressedText.has(mode)) {
        this.emit('text', {mode, text});
      }
    }

    setContext(name) {
      this.context = global.commands.contexts.get(name);
      this.context.enter(this, this.context);
    }

    extendContext(name) {
    }
  };
};

module.exports.priority = 100;