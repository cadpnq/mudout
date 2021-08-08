module.exports = function GameString(extend) {
  return class GameString extends extend {
    static initialize(data) {
      super.initialize(data);
      this.defineInstanceVariable('value', { value: '' });
    }

    modify(data) {
      super.modify(data);
      this.register('strings');
    }
  };
};

module.exports.priority = 100;
