module.exports = function Persistent(extend) {
  return class Persistent extends extend {
    set dirty(value) {
      super.dirty = value;
      if (value) {
        this.register('persist');
      } else {
        this.unregister('persist');
      }
    }
  };
};

module.exports.priority = 50;
