let SimpleObject = (extend) => {
  return class Template extends extend {
    static initialize(data) {
      super.initialize(data);
      this.defineStaticVariable('staticVar', {value: 0});
      this.defineInstanceVariable('instanceVar', {value: 1});
      this.defineInstanceVariable('instanceRef', {reference: true});
    }
  }
};

SimpleObject.priority = 100;
module.exports = SimpleObject;
