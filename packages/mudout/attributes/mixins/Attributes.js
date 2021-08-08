module.exports = function Attributes(extend) {
  return class Attributes extends extend {
    attributes = new Map();

    constructor() {
      super();

      for (const [name, definition] of this.attributeDefinitions) {
        this.attributes.set(
          name,
          global.objects.new('attribute', { object: this, ...definition })
        );
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
      for (const name in data.attributes) {
        const value = data.attributes[name];
        this.getAttributeDefinition(name).value = value;
      }
      super.modify(data);
    }

    modify(data) {
      super.modify(data);
      for (const [name, { value }] of this.attributeDefinitions) {
        this.attribute(name).baseValue = value;
      }
    }

    static load(obj, data) {
      super.load(obj, data);
      for (const name in data.attributes) {
        if (obj.attributes.has(name)) {
          obj.attribute(name).instanceModifier = data.attributes[name];
        }
      }
      obj.forceAttributeUpdate(0);
      return obj;
    }

    save() {
      const attributes = {};
      for (const [name, attribute] of this.attributes) {
        attributes[name] = attribute.instanceModifier;
      }
      return { ...super.save(), attributes };
    }

    delete() {
      super.delete();
      for (const [, attribute] of this.attributes) {
        attribute.delete();
      }
    }

    static defineAttribute(
      name,
      { value = 0, minimum, maximum, rate, parents, func } = {}
    ) {
      const definition = this.getAttributeDefinition(name);
      definition.value = value;

      if (minimum !== undefined) {
        const minimumName = `${name}_minimum`;
        if (typeof minimum === 'function') {
          this.defineAttribute(minimumName, { func: minimum, parents });
        } else {
          this.defineAttribute(minimumName, { value: minimum, parents });
        }
        this.linkAttribute(minimumName, name, 'minimum');
      }

      if (maximum !== undefined) {
        const maximumName = `${name}_maximum`;
        if (typeof maximum === 'function') {
          this.defineAttribute(maximumName, { func: maximum, parents });
        } else {
          this.defineAttribute(maximumName, { value: maximum, parents });
        }
        this.linkAttribute(maximumName, name, 'maximum');
      }

      if (rate !== undefined) {
        const rateName = `${name}_rate`;
        if (typeof rate === 'function') {
          this.defineAttribute(rateName, { func: rate, parents });
        } else {
          this.defineAttribute(rateName, { value: rate, parents });
        }
        this.linkAttribute(rateName, name, 'rate');
      }

      if (func) {
        definition.func = func;
      }

      if (parents) {
        for (const parent of parents) {
          this.getAttributeDefinition(parent).children.add(name);
        }
      }
    }

    static getAttributeDefinition(name) {
      if (this.attributeDefinitions.has(name)) {
        return this.attributeDefinitions.get(name);
      } else {
        const definition = { name, value: 0, children: new Set() };
        this.attributeDefinitions.set(name, definition);
        return definition;
      }
    }

    static linkAttribute(name, to, as) {
      if (as !== 'parent') {
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
      for (const [, attribute] of this.attributes) {
        attribute.runSystem('attribute', t);
        attribute.value = attribute.nextValue;
      }
    }
  };
};

module.exports.priority = 100;
