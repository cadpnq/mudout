let Persistent = (extend) => {
  class Persistent extends extend {
    constructor() {
      super();
      this.register('persist');
    }
  }
  return Persistent;
};

module.exports = Persistent;
module.exports.priority = 50;
