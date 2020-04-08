const EventEmitter = require('events');

let Evented = (extend) => {
  return class Evented extends extend {
    constructor() {
      super();
      this.emitter = new EventEmitter();

      for (let name of this.externalEvents) {
        this.emitter.on(name, (...args) => {
          if (this.session) {
            this.session.emit(name, ...args);
          }
        });
      }
    }

    static initialize(data) {
      super.initialize(data);
      this.externalEvents = new Set();
      this.prototype.externalEvents = this.externalEvents;
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
  }
};

Evented.priority = 50;
module.exports = Evented;
