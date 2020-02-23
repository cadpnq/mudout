const ipc = require('node-ipc');

let Session = (extend) => {
  return class Session extends extend {
    constructor() {
      super();
      this.socket;
      this.context;
      this.account;
      this.character;
      this.mode = 'user';
      this.suppressedText = new Set();
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

    exec(command) {
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
      this.context = global.commands.contexts.get(name).newInstance(this);
      this.context.enter(this, this.context);
    }

    extendContext(name) {
    }
  }
};

Session.priority = 100;
module.exports = Session;
