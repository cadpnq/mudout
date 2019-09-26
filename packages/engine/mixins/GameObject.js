const uniqid = require('uniqid');

let GameObject = (extend) => {
  return class GameObject {
    constructor() {
      this.dirty = true;
      this.systems = new Set();
      this.instanceData = {};

      this.instances.add(this);

      for (let [name, {value, expose, reference}] of this.instanceVariables) {
        Object.defineProperty(this, `_${name}`, {
          get: () => {
            return this.instanceData[name];
          },
          set: (value) => {
            if (value != this.instanceData[name]) {
              this.instanceData[name] = value;
              this.dirty = true;
            }
          }
        });
        if (expose) {
          Object.defineProperty(this, name, {
            get: () => {
              return this[`_${name}`];
            },
            set: (value) => {
              this[`_${name}`] = value;
            }
          });
        }
        if (value != undefined) {
          this[name] = value;
        }
      }
    }

    static initialize(data) {
      this.staticVariables = new Map();
      this.instanceVariables = new Map();
      this.prototype.staticVariables = this.staticVariables;
      this.prototype.instanceVariables = this.instanceVariables;
      this.instances = new Set();
      this.prototype.instances = this.instances;

      this.defineStaticVariable('name', {save: true});
      this.defineStaticVariable('id', {save: true});
      this.defineStaticVariable('type', {save: true});
      this.defineInstanceVariable('uid');
      this.modify(data);
    }

    static modify(data) {
      this.baseData = data;
      for (let [name, value] of this.staticVariables) {
        if (data[name]) {
          this.prototype[name] = data[name];
        }
      }

      for (let instance of this.instances) {
        instance.modify(data);
      }
    }

    modify(data) {
      if (data.instanceData) {
        for (let name in data.instanceData) {
          this[name] = data.instanceData[name];
        }
      }

      if (data.references) {
        for (let name in data.references) {
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
      let data = {instanceData: {}, references: {}};
      for (let [name, {save}] of this.staticVariables) {
        if (save) {
          data[name] = this[name];
        }
      }

      for (let [name, {reference}] of this.instanceVariables) {
        if (this[name] != undefined) {
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
      for (let system of this.systems) {
        this.unregister(system);
      }
      this.instances.delete(this);
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

    static defineStaticVariable(name, {value, save = false} = {}) {
      this.prototype[name] = value;
      this.staticVariables.set(name, {name, save});
    }

    static defineInstanceVariable(name, {value, expose = true, reference = false} = {}) {
      this.instanceVariables.set(name, {value, expose, reference});
    }
  }
};

module.exports = GameObject;
module.exports.priority = 0;
