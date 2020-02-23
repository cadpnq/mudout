let Persistent = (extend) => {
  return class Persistent extends extend {
    constructor() {
      super();
    }

    set dirty(value) {
      super.dirty = value;
      if (value) {
        this.register('persist');
      } else {
        this.unregister('persist');
      }
    }

    get dirty() {
      return super.dirty;
    }
  }
};

Persistent.priority = 50;
module.exports = Persistent;
