
class PackageManager {
  constructor() {
    this.packages = new Set();
    this.watchers = new Set();

    for (let pack of global.config.packages) {
      this.addPackage(pack);
    }
  }

  addPackage(name) {
    global.logger.info(`Adding package: ${name}`);
    this.packages.add(name);
    for (let watcher of this.watchers) {
      watcher.addPackage(name);
    }
  }

  addWatcher(watcher) {
    this.watchers.add(watcher);
    for (let name of this.packages) {
      watcher.addPackage(name);
    }
    watcher.initializePackages();
  }
}

module.exports = PackageManager;
