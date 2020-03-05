
class PackageManager {
  constructor() {
    this.packages = new Map();
    this.watchers = new Set();

    for (let pack of global.config.packages) {
      this.addPackage(pack);
    }
  }

  resolvePackage(name) {
    let [root, path] = name.split(':');
    let rootPath = global.config.packageRoots[root]
    if (!rootPath) {
      global.logger.error(`The package root: ${root} is unknown`);
      return '';
    }
    return `${rootPath}/${path}`;
  }

  addPackage(name) {
    global.logger.info(`Adding package: ${name}`);
    let path = this.resolvePackage(name);
    if (!path) {
      return;
    }
    this.packages.set(name, path);
    for (let watcher of this.watchers) {
      watcher.addPackage(path);
    }
  }

  addWatcher(watcher) {
    this.watchers.add(watcher);
    for (let [name, path] of this.packages) {
      watcher.addPackage(path);
    }
    watcher.initializePackages();
  }
}

module.exports = PackageManager;
