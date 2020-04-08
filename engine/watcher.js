const chokidar = require('chokidar');
const misc = require('./misc');

class Watcher {
  constructor(packageFolder = '') {
    this.packagePaths = new Set();
    this.changes = new Set();
    this.packageFolder = packageFolder;

    this.watcher = chokidar.watch([], {
      persistent: true,
      ignoreInitial: true
    });

    let addChange = (path) => {
      this.addChange(path);
    }
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
    for (let path of this.changes) {
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
    for (let packagePath of this.packagePaths) {
      let path = `${packagePath}/${this.packageFolder}`;
      for (let file of misc.walkSync(path)) {
        this.doLoad(file);
      }
      this.watcher.add(path);
    }
  }

  stop() {
    for (let packagePath of this.packagePaths) {
      this.watcher.unwatch(`${packagePath}/${this.packageFolder}`);
    }
    this.watcher.close();
  }
}

module.exports = Watcher;
