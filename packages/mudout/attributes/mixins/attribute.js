let Attribute = (extend) => {
  class Attribute extends extend {
    constructor() {
      super();
      this.modifiers = new Set();
      this._active = false;
      this._value = 0;
      this._baseValue = 0;
    }

    set active(value) {
      this._active = value;
      if (value) {
        this.register('attribute');
        for (let attribute of this.children) {
          if (this.object.attributes.has(attribute)) {
            this.object.attributes.get(attribute).active = true;
          }
        }
      } else {
        this.unregister('attribute');
      }
    }

    get active() {
      return this._active;
    }

    set value(value) {
      let min = -Infinity;
      let max = Infinity;

      if (this.minimum) {
        min = this.object.attributeValue(this.minimum);
      }
      if (this.maximum) {
        max = this.object.attributeValue(this.maximum);
      }

      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      }

      this.instanceModifier = (value - this.baseValue);
      this.active = true;
      this._value = value;
    }

    get value() {
      return this._value;
    }

    set baseValue(value) {
      if (this._baseValue != value) {
        this._baseValue = value;
        this.active = true;
      }
    }

    get baseValue() {
      return this._baseValue;
    }

    static initialize(data) {
      super.initialize(data);
      this.defineInstanceVariable('instanceModifier', {value: 0});
    }

    static modify(data) {
      super.modify(data);
    }

    modify(data) {
      super.modify(data);
    }

    static new(obj, {object, name, value, minimum, maximum, rate, func, children}) {
      super.new(obj, arguments[1]);
      obj.object = object;
      obj.children = children;

      obj.name = name;
      obj.baseValue = value;
      obj.value = value;
      if (minimum) obj.minimum = minimum;
      if (maximum) obj.maximum = maximum;
      if (rate) obj.rate = rate;
      if (func) obj.func = func;

      obj.active = true;

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
  }
  return Attribute;
};

Attribute.priority = 100;
module.exports = Attribute;
