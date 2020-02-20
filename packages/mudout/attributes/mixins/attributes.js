let Attributes = (extend) => {
  class Attributes extends extend {
    constructor() {
      super();
      this.attributes = new Map();

      for (let [name, definition] of this.attributeDefinitions) {
        this.attributes.set(name, global.objects.new('attribute', {object: this, ...definition}));
        Object.defineProperty(this, name, {
          get: () => {
            return this.attributeValue(name);
          },
          set: (value) => {
            this.attribute(name).value = value;
          }
        });
      }
    }

    static initialize(data) {
      this.attributeDefinitions = new Map();
      this.prototype.attributeDefinitions = this.attributeDefinitions;
      super.initialize(data);
    }

    static modify(data) {
      for (let name in data.attributes) {
        let value = data.attributes[name];
        this.getAttributeDefinition(name).value = value;
      }
      super.modify(data);
    }

    modify(data) {
      super.modify(data);
      for (let [name, {value}] of this.attributeDefinitions) {
        this.attribute(name).baseValue = value;
      }
    }

    static new(obj, args) {
      super.new(obj, args);
      return obj;
    }

    static load(obj, data) {
      super.load(obj, data);
      for (let name in data.attributes) {
        if (obj.attributes.has(name)) {
          obj.attribute(name).instanceModifier = data.attributes[name];
        }
      }
      obj.forceAttributeUpdate(0);
      return obj;
    }

    save() {
      let attributes = {};
      for (let [name, attribute] of this.attributes) {
        attributes[name] = attribute.instanceModifier;
      }
      return {...super.save(), attributes};
    }

    delete() {
      super.delete();
      for (let [,attribute] of this.attributes) {
        attribute.delete();
      }
    }

    static defineAttribute(name, {value = 0, minimum, maximum, rate, parents, func} = {}) {
      let definition = this.getAttributeDefinition(name);
      definition.value = value;
      if (minimum != undefined) {
        let minimumName = `${name}_minimum`;
        if (typeof minimum == 'function') {
          this.defineAttribute(minimumName, {func: minimum, parents});
        } else {
          this.defineAttribute(minimumName, {value: minimum, parents});
        }
        this.linkAttribute(minimumName, name, 'minimum');
      }

      if (maximum != undefined) {
        let maximumName = `${name}_maximum`;
        if (typeof maximum == 'function') {
          this.defineAttribute(maximumName, {func: maximum, parents});
        } else {
          this.defineAttribute(maximumName, {value: maximum, parents});
        }
        this.linkAttribute(maximumName, name, 'maximum');
      }

      if (rate != undefined) {
        let rateName = `${name}_rate`;
        if (typeof rate == 'function') {
          this.defineAttribute(rateName, {func: rate, parents});
        } else {
          this.defineAttribute(rateName, {value: rate, parents});
        }
        this.linkAttribute(rateName, name, 'rate');
      }

      if (func) {
        definition.func = func;
      }

      if (parents) {
        for (let parent of parents) {
          this.getAttributeDefinition(parent).children.add(name);
        }
      }
    }

    static getAttributeDefinition(name) {
      if (this.attributeDefinitions.has(name)) {
        return this.attributeDefinitions.get(name);
      } else {
        let definition = {name, value: 0, children: new Set()};
        this.attributeDefinitions.set(name, definition);
        return definition;
      }
    }

    static linkAttribute(name, to, as) {
      if (as != 'parent') {
        this.attributeDefinitions.get(to)[as] = name;
      }
      this.attributeDefinitions.get(name).children.add(to);
    }

    attribute(name) {
      return this.attributes.get(name);
    }

    attributeValue(name) {
      return this.attribute(name).value;
    }

    forceAttributeUpdate(t) {
      for (let [name, attribute] of this.attributes) {
        attribute.runSystem('attribute', t);
        attribute.value = attribute.nextValue;
      }
    }
  }
  return Attributes;
};

Attributes.priority = 100;
module.exports = Attributes;
