const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('path').parse;

const watcher = require('./watcher');
const misc = require('./misc');

module.exports = class ObjectManager extends watcher {
  types = new Map();
  typeDefinitions = new Map();
  objects = new Map();
  instances = new Map();
  mixins = new Map();
  namedInstances = new Map();
  deferredInstances = new Set();
  initialLoad = true;

  constructor(options) {
    super('objects');
  }

  start() {
    super.start();
    this.initialLoad = false;

    global.logger.info('Loading instances...');

    let instances = 0;
    for (let file of misc.walkSync(`${global.config.instancePath}`)) {
      this.get(parse(file).name).dirty = false;
      instances += 1;
    }

    global.logger.info(`Loaded ${instances} instances`);
    this.checkDeferred();
  }

  addPackage(path) {
    super.addPackage(path);

    for (const file of misc.walkSync(`${path}/mixins/`)) {
      this.addMixin(require(`./../${file}`))
    }

    for (const file of misc.walkSync(`${path}/types/`)) {
      const {name, mixins} = yaml.load(fs.readFileSync(file));
      this.defineType(name, ...mixins);
    }
  }

  defer(path, data) {
    this.deferredInstances.add({path, data});
  }

  load(path, data) {
    if (!data) {
      data = yaml.load(fs.readFileSync(path));
    }

    if (data.type == 'instance') {
      if (this.initialLoad || !this.objectReady(data.of)) {
        this.defer(path, data);
        return;
      }
      let instance = this.instances.get(data.name);
      if (!instance) {
        const object = this.objects.get(data.of);
        instance = new object;
        object.new(instance);
        instance.uid = data.name;
        this.instances.set(instance.uid, instance);
      }
      instance.modify(data);
    } else {
      let obj = this.objects.get(data.id);
      if (!obj) {
        global.logger.info(`Defining a new object: ${data.id}`);
        obj = this.types.get(data.type)(data);
        this.objects.set(data.id, obj);
      } else {
        obj.modify(data);
      }
      this.checkDeferred();
    }
  }

  checkDeferred() {
    const deferred = Array.from(this.deferredInstances);
    this.deferredInstances = new Set();
    for (const instance of deferred) {
      this.load(instance.path, instance.data);
    }
  }

  objectReady(id) {
    if (!this.objects.has(id)) {
      return false;
    } else {
      return this.objects.get(id).ready();
    }
  }

  instanceReady(uid) {
    if (uid == undefined) {
      return true;
    } else {
      return this.instances.has(uid);
    }
  }

  addMixin(mixin) {
    global.logger.info(`Defining mixin: ${mixin.name}`);
    this.mixins.set(mixin.name, mixin);
  }

  defineType(name, ...mixins) {
    let definition = this.typeDefinitions.get(name);
    if (!definition) {
      definition = [];
      this.typeDefinitions.set(name, definition);
      global.logger.info(`Defining type: ${name}, ${mixins}`);
    } else {
      global.logger.info(`Ammending type with: ${name}, ${mixins}`);
    }
    for (const mixin of mixins) {
      definition.push(mixin);
    }
  }

  initializePackages() {
    super.initializePackages();
    this.finalizeTypes();
  }

  finalizeTypes() {
    global.logger.info('Finalizing types');

    for (const [name, definition] of this.typeDefinitions) {
      const mixinFunctions = definition.map((m) => {
        return this.mixins.get(m);
      });
      mixinFunctions.sort((a,b) => {
        return a.priority > b.priority;
      });

      this.types.set(name, (data) => {
        let objectClass;
        for (const mixin of mixinFunctions) {
          objectClass = mixin(objectClass);
        }
        objectClass.initialize(data);
        objectClass.modify(data);
        objectClass.prototype.mixins = new Set(definition);
        return objectClass;
      });

      if (definition.includes('Internal')) {
        this.load(name, {name, id: name, type: name});
      }
    }
  }

  new(id, ...args) {
    const object = this.objects.get(id);
    let instance = new object;
    instance = object.new(instance, ...args);
    this.instances.set(instance.uid, instance);
    return instance;
  }

  loadInstance(data) {
    const object = this.objects.get(data.id);
    const instance = new object;
    object.load(instance, data);
    this.instances.set(instance.uid, instance);
    return instance;
  }

  get(uid) {
    if (this.instances.has(uid)) {
      return this.instances.get(uid);
    } else {
      const fname = `${global.config.instancePath}/${uid}`;
      if (fs.existsSync(fname)) {
        const data = yaml.load(fs.readFileSync(fname));
        // We should probably be validating the data here...
        const object = this.objects.get(data.id);
        const instance = new object;
        this.instances.set(uid, instance);
        object.load(instance, data);
        return instance;
      }
    }
  }
};