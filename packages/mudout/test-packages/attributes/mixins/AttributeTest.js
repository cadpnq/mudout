module.exports = function AttributeTest(extend) {
  return class AttributeTest extends extend {
    static initialize(data) {
      super.initialize(data);
      this.defineAttribute('test', {
        value: 0,
        minimum: 0,
        maximum: 100,
        rate: 0
      });
      this.defineAttribute('doubleTest', {
        parents: ['test'],
        func: (o) => {
          return o.test * 2;
        }
      });
    }
  };
};

module.exports.pritority = 300;
