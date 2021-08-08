const uniqid = require('uniqid');

module.exports = function GameObject(extend) {
  return class GameObject {
    #dirty = true;
    #instanceData = {};
    systems = new Set();

    static instances = new Set();
    static staticVariables = new Map();
    static instanceVariables = new Map();

    constructor() {
      this.constructor.instances.add(this);

      for (const [name, { value, expose, reference }] of this.constructor
        .instanceVariables) {
        Object.defineProperty(this, `#${name}`, {
          get: () => {
            return this.#instanceData[name];
          },
          set: (value) => {
            if (value !== this.#instanceData[name]) {
              this.#instanceData[name] = value;
              this.#dirty = true;
            }
          }
        });
        if (expose) {
          Object.defineProperty(this, name, {
            get: () => {
              return this[`#${name}`];
            },
            set: (value) => {
              this[`#${name}`] = value;
            }
          });
        }
        if (value !== undefined) {
          this[name] = value;
        }
      }
    }

    set dirty(value) {
      this.#dirty = value;
    }

    get dirty() {
      return this.#dirty;
    }

    static initialize(data) {
      this.defineStaticVariable('name', { save: true });
      this.defineStaticVariable('id', { save: true });
      this.defineStaticVariable('type', { save: true });
      this.defineInstanceVariable('uid');
      this.modify(data);
    }

    static modify(data) {
      for (const [name, value] of this.staticVariables) {
        if (data[name]) {
          this.prototype[name] = data[name];
        }
      }

      for (const instance of this.instances) {
        instance.modify(data);
      }
    }

    modify(data) {
      if (data.instanceData) {
        for (const name in data.instanceData) {
          this[name] = data.instanceData[name];
        }
      }

      if (data.references) {
        for (const name in data.references) {
          this[name] = global.objects.get(data.references[name]);
        }
      }
    }

    static ready() {
      return true;
    }

    static new(obj) {
      obj.uid = uniqid(`${obj.id}-`);
      return obj;
    }

    static load(obj, data) {
      obj.modify(data);
      return obj;
    }

    save() {
      const data = { instanceData: {}, references: {} };
      for (const [name, { save }] of this.constructor.staticVariables) {
        if (save) {
          data[name] = this[name];
        }
      }

      for (const [name, { reference }] of this.constructor.instanceVariables) {
        if (this[name] !== undefined) {
          if (reference) {
            data.references[name] = this[name].uid;
          } else {
            data.instanceData[name] = this[name];
          }
        }
      }

      return data;
    }

    delete() {
      for (const system of this.systems) {
        this.unregister(system);
      }
      this.constructor.instances.delete(this);
      global.objects.instances.delete(this.uid);
    }

    register(name) {
      if (!this.systems.has(name)) {
        this.systems.add(name);
        global.systems.register(name, this);
      }
    }

    unregister(name) {
      if (this.systems.has(name)) {
        this.systems.delete(name);
        global.systems.unregister(name, this);
      }
    }

    runSystem(name, t) {
      if (global.systems.has(name)) {
        global.systems[name].each(this, t);
      }
    }

    static defineStaticVariable(name, { value, save = false } = {}) {
      this.prototype[name] = value;
      this.staticVariables.set(name, { name, save });
    }

    static defineInstanceVariable(
      name,
      { value, expose = true, reference = false } = {}
    ) {
      this.instanceVariables.set(name, { value, expose, reference });
    }
  };
};

module.exports.priority = 0;
