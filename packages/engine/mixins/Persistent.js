let Persistent = (extend) => {
  class Persistent extends extend {
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
  return Persistent;
};

module.exports = Persistent;
module.exports.priority = 50;
