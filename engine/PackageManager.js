module.exports = class PackageManager {
  packages = new Map();
  watchers = new Set();

  constructor() {
    for (const pack of global.config.packages) {
      this.addPackage(pack);
    }
  }

  resolvePackage(name) {
    const [root, path] = name.split(':');
    const rootPath = global.config.packageRoots[root];
    if (!rootPath) {
      global.logger.error(`The package root: ${root} is unknown`);
      return '';
    }
    return `${rootPath}/${path}`;
  }

  addPackage(name) {
    global.logger.info(`Adding package: ${name}`);
    const path = this.resolvePackage(name);
    if (!path) {
      return;
    }
    this.packages.set(name, path);
    for (const watcher of this.watchers) {
      watcher.addPackage(path);
    }
  }

  addWatcher(watcher) {
    this.watchers.add(watcher);
    for (const [, path] of this.packages) {
      watcher.addPackage(path);
    }
    watcher.initializePackages();
  }
};