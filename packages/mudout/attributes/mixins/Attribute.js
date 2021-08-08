module.exports = function Attribute(extend) {
  return class Attribute extends extend {
    modifiers = new Set();
    #active = false;
    #value = 0;
    #baseValue = 0;

    set active(value) {
      this.#active = value;

      if (value) {
        this.register('attribute');
        for (const attribute of this.children) {
          if (this.object.attributes.has(attribute)) {
            this.object.attributes.get(attribute).active = true;
          }
        }
      } else {
        this.unregister('attribute');
      }
    }

    get active() {
      return this.#active;
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

      this.instanceModifier = value - this.baseValue;
      this.active = true;
      this.#value = value;
    }

    get value() {
      return this.#value;
    }

    set baseValue(value) {
      if (this.#baseValue !== value) {
        this.#baseValue = value;
        this.active = true;
      }
    }

    get baseValue() {
      return this.#baseValue;
    }

    static initialize(data) {
      super.initialize(data);
      this.defineInstanceVariable('instanceModifier', { value: 0 });
    }

    static new(
      obj,
      { object, name, value, minimum, maximum, rate, func, children }
    ) {
      super.new(obj, arguments[1]);
      obj.object = object;
      obj.children = children;

      obj.name = name;
      obj.baseValue = value;
      obj.value = value;
      if (minimum) {
        obj.minimum = minimum;
      }
      if (maximum) {
        obj.maximum = maximum;
      }
      if (rate) {
        obj.rate = rate;
      }
      if (func) {
        obj.func = func;
      }
      obj.active = true;

      return obj;
    }
  };
};

module.exports.priority = 100;
