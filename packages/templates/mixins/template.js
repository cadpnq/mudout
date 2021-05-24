module.exports = function Template(extend) {
  return class Template extends extend {
    constructor() {
      super();
    }

    static initialize(data) {
      super.initialize(data);
    }

    static modify(data) {
      super.modify(data);
    }

    modify(data) {
      super.modify(data);
    }

    static ready() {
      return super.ready();
    }

    static new(obj, args) {
      super.new(obj, args);
      return obj;
    }

    static load(obj, data) {
      super.load(obj, data);
      return obj;
    }

    save() {
      return super.save();
    }

    delete() {
      super.delete();
    }
  };
};

module.exports.priority = 0;