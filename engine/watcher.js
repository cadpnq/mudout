const chokidar = require('chokidar');
const misc = require('./misc');

class Watcher {
  constructor(packageFolder = '') {
    this.packages = new Set();
    this.changes = new Set();
    this.packageFolder = packageFolder;

    this.watcher = chokidar.watch('', {
      persistent: true,
      ignoreInitial: true
    });

    let addChange = (path) => {
      this.addChange(path);
    }
    this.watcher.on('add', addChange);
    this.watcher.on('change', addChange);
  }

  addPackage(name) {
    this.packages.add(name);
  }

  initializePackages() {
  }

  addChange(path) {
    if (global.config.activeHotload) {
      this.load(path);
    } else {
      this.changes.add(path);
    }
  }

  loadChanges() {
    for (let path of this.changes) {
      this.load(path);
      this.changes.delete(path);
    }
  }

  load(path, data) {
  }

  start() {
    global.packages.addWatcher(this);
    for (let name of this.packages) {
      let path = `${global.config.packageRoot}/${name}/${this.packageFolder}`;
      for (let file of misc.walkSync(path)) {
        this.load(file);
      }
      this.watcher.add(path);
    }
  }

  stop() {
  }
}

module.exports = Watcher;
