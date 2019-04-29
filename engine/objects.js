const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('path').parse;

const watcher = require('./watcher');
const misc = require('./misc');

class ObjectManager extends watcher {
  constructor(options) {
    super('objects');
    this.types = new Map();
    this.typeDefinitions = new Map();
    this.objects = new Map();
    this.instances = new Map();
    this.mixins = new Map();
    this.namedInstances = new Map();
    this.deferredInstances = new Set();
    this.initialLoad = true;
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

  addPackage(name) {
    super.addPackage(name);

    let packagePath = `${global.config.packageRoot}/${name}`;

    for (let file of misc.walkSync(`${packagePath}/mixins/`)) {
      this.defineMixin(require(`./../${file}`))
    }

    for (let file of misc.walkSync(`${packagePath}/types/`)) {
      let {name, mixins} = yaml.safeLoad(fs.readFileSync(file));
      this.defineType(name, ...mixins);
    }
  }

  loadInstance(data) {
    return this.objects.get(data.id).load(data);
  }

  defer(path, data) {
    this.deferredInstances.add({path, data});
  }

  load(path, data) {
    if (!data) {
      data = yaml.safeLoad(fs.readFileSync(path));
    }

    if (data.type == 'instance') {
      if (this.initialLoad || !this.objectReady(data.of)) {
        this.defer(path, data);
        return;
      }
      let instance = this.instances.get(data.name);
      if (!instance) {
        let object = this.objects.get(data.of);
        instance = new object;
        object.new(instance);
        instance.uid = data.name;
        this.instances.set(instance.uid, instance);
      }
      instance.modify(data);
    } else {
      let obj = this.objects.get(data.id);
      if (!obj) {
        global.logger.info(`Defining a new object: ${data.type}`);
        obj = this.types.get(data.type)(data);
        this.objects.set(data.id, obj);
      } else {
        obj.modify(data);
      }
      this.checkDeferred();
    }
  }

  checkDeferred() {
    let deferred = Array.from(this.deferredInstances);
    this.deferredInstances = new Set();
    for (let instance of deferred) {
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

  defineMixin(mixin) {
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
    for (let mixin of mixins) {
      definition.push(mixin);
    }
  }

  initializePackages() {
    super.initializePackages();
    this.finalizeTypes();
  }

  finalizeTypes() {
    global.logger.info('Finalizing types');
    for (let [name, definition] of this.typeDefinitions) {
      let mixinFunctions = definition.map((m) => {
        return this.mixins.get(m);
      });
      mixinFunctions.sort((a,b) => { return a.priority > b.priority; });

      this.types.set(name, (data) => {
        let objectClass;
        for (let mixin of mixinFunctions) {
          objectClass = mixin(objectClass);
        }
        objectClass.initialize(data);
        objectClass.modify(data);
        objectClass.prototype.mixins = new Set(definition);
        return objectClass;
      });

      if (definition.includes('Internal')) {
        this.load(name, {name: name, id: name, type: name});
      }
    }
  }

  new(id, ...args) {
    let object = this.objects.get(id);
    let instance = new object;
    object.new(instance, ...args);
    this.instances.set(instance.uid, instance);
    return instance;
  }

  get(uid) {
    if (this.instances.has(uid)) {
      return this.instances.get(uid);
    } else {
      let fname = `${global.config.instancePath}/${uid}`;
      if (fs.existsSync(fname)) {
        let data = yaml.safeLoad(fs.readFileSync(fname));
        // We should probably be validating the data here...
        let object = this.objects.get(data.id);
        let instance = new object;
        this.instances.set(uid, instance);
        object.load(instance, data);
        return instance;
      }
    }
  }
}

module.exports = ObjectManager;
