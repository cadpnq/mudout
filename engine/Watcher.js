const chokidar = require('chokidar');
const misc = require('./misc');

module.exports = class Watcher {
  packagePaths = new Set();
  changes = new Set();
  watcher = chokidar.watch([], {
    persistent: true,
    ignoreInitial: true
  });

  constructor(packageFolder = '') {
    this.packageFolder = packageFolder;

    const addChange = (path) => {
      this.addChange(path);
    };

    this.watcher.on('add', addChange);
    this.watcher.on('change', addChange);
  }

  addPackage(path) {
    this.packagePaths.add(path);
  }

  initializePackages() {
  }

  addChange(path) {
    if (global.config.activeHotload) {
      this.doLoad(path);
    } else {
      this.changes.add(path);
    }
  }

  loadChanges() {
    for (const path of this.changes) {
      this.doLoad(path);
      this.changes.delete(path);
    }
  }

  doLoad(path) {
    try {
      this.load(path);
    } catch (error) {
      global.logger.error(`There was an error loading: ${path}\n${error.stack}`);
    }
  }

  load(path, data) {
  }

  start() {
    global.packages.addWatcher(this);
    for(const packagePath of this.packagePaths) {
      const path = `${packagePath}/${this.packageFolder}`;
      for (const file of misc.walkSync(path)) {
        this.doLoad(file);
      }
    }
  }

  stop() {
    for (const packagePath of this.packagePaths) {
      this.watcher.unwatch(`${packagePath}/${this.packageFolder}`);
    }
    this.watcher.close();
  }
};