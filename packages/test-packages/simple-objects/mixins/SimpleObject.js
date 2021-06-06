module.exports = function SimpleObject(extend) {
  return class SimpleObject extends extend {
    static initialize(data) {
      super.initialize(data);
      this.defineStaticVariable('staticVar', {value: 0});
      this.defineInstanceVariable('instanceVar', {value: 1});
      this.defineInstanceVariable('instanceRef', {reference: true});
    }
  };
};

module.exports.priority = 100;