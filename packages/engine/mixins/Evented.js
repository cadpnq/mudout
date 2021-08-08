const EventEmitter = require('events');

module.exports = (extend) => {
  return class Evented extends extend {
    emitter = new EventEmitter();
    static externalEvents = new Set();

    constructor() {
      super();
      for (const name of this.constructor.externalEvents) {
        this.emitter.on(name, (...args) => {
          if (this.session) {
            this.session.emit(name, ...args);
          }
        });
      }
    }

    static defineExternalEvent(name) {
      this.externalEvents.add(name);
    }

    emit(name, ...args) {
      this.emitter.emit(name, ...args);
    }

    on(name, func) {
      this.emitter.on(name, func);
    }

    once(name, func) {
      this.emitter.once(name, func);
    }
  };
};

module.exports.priority = 50;
