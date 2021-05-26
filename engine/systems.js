const watcher = require('./watcher');
const misc = require('./misc');
const { map } = require('blessed-contrib');

class System {
  objects = new Set();
  index = new Map();
  indexBy = '';
  priority = 0;
  interval = 0;
  elapsed = 0;
  name;
  totalTime = 0;

  each(obj, t) {
  }

  before(t) {
  }

  after(t) {
  }

  update(t) {
    this.elapsed = 0;
    
    const totalStart = misc.time();
    
    this.before(this, t);
    for (const obj of this.objects) {
      this.each(obj, t);
    }
    this.after(this, t);

    this.totalTime += misc.time(totalStart);
  }

  register(obj) {
    this.objects.add(obj);
    if (this.indexBy) {
      this.index.set(obj[this.indexBy], obj);
    }
  }

  unregister(obj) {
    this.objects.delete(obj);
    if (this.indexBy) {
      this.index.delete(obj[this.indexBy]);
    }
  }
}

module.exports = class SystemManager extends watcher {
  systems = new Map();
  running = false;
  interval = global.config.systemRate;
  lastTick;
  timeout;
  waitTime;

  constructor() {
    super('systems');
  }

  load(path, data) {
    global.logger.info(`Loading system: ${path}`);
    if (!data) {
      data = misc.requireReload(`./../${path}`);
    }
    let system;
    if (this.systems.has(data.name)) {
      system = this.systems.get(data.name);
    } else {
      system = new System();
      this[data.name] = system;
      this.systems.set(data.name, system);
    }

    for (const name in data) {
      const value = data[name];
      if (value instanceof Function) {
        system[name] = value.bind(system);
      } else {
        system[name] = value;
      }
    }
  }

  // Instead of collecting/sorting a list each time it would be better to pre-sort the systems.
  update(t) {
    const systems = [];
    for (const system of this.systems.values()) {
      system.elapsed += t;
      if (system.elapsed >= system.interval) {
        systems.push(system);
      }
    }
    systems.sort((a,b) => { return a.priority > b.priority; });
    for (const system of systems) {
      system.update(t);
    }
  }

  tick() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (!this.running) return;

    const start = Date.now();
    this.update(start - this.lastTick);
    const end = Date.now();
    this.lastTick = start;

    this.waitTime = this.interval - (end - start);
    if (this.waitTime <= global.config.minimumWait) {
      this.waitTime = global.config.minimumWait;
    }
    this.timeout = setTimeout(() => {
      this.tick();
    }, this.waitTime);
  }

  start() {
    super.start();
    this.running = true;
    this.lastTick = Date.now();
    this.tick();
  }

  stop() {
    super.stop();
    this.running = false;
    clearTimeout(this.timeout);
  }

  register(name, obj) {
    if (this.systems.has(name)) {
      this.systems.get(name).register(obj);
    }
  }

  unregister(name, obj) {
    if (this.systems.has(name)) {
      this.systems.get(name).unregister(obj);
    }
  }

  has(name) {
    return this.systems.has(name);
  }
};