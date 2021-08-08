const PackageManager = require('./../engine/PackageManager');
const Watcher = require('./../engine/Watcher');

describe('Packages', function () {
  before(function () {
    global.config = {
      packageRoots: {
        core: 'packages'
      },
      packages: ['core:foo'],
      enableLogging: false
    };

    global.logger = require('./../engine/logger');
  });

  beforeEach(function () {
    global.packages = new PackageManager();
  });

  describe('PackageManager', function () {
    it('should have packages in config added when instantiated', function () {
      assert(global.packages.packages.has('core:foo'));
    });

    describe('addPackage()', function () {
      it('should add a package', function () {
        global.packages.addPackage('core:bar');
        assert(global.packages.packages.has('core:bar'));
      });
    });

    describe('Watcher', function () {
      let watcher;

      beforeEach(function () {
        watcher = new Watcher();
      });

      afterEach(function () {
        watcher.stop();
      });

      it('should add package to all watchers', function () {
        global.packages.addWatcher(watcher);
        global.packages.addPackage('core:bar');
        assert(watcher.packagePaths.has('packages/bar'));
      });

      describe('addWatcher()', function () {
        it('should add a watcher', function () {
          global.packages.addWatcher(watcher);
          assert(global.packages.watchers.has(watcher));
        });

        it('should add all packages to watcher', function () {
          global.packages.addWatcher(watcher);
          assert(watcher.packagePaths.has('packages/foo'));
        });
      });
    });
  });
});
