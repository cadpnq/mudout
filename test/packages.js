const PackageManager = require('./../engine/packages');
const Watcher = require('./../engine/watcher');

describe('Packages', function() {
  before(function() {
    global.config = {
      packages: [
        'foo',
      ],
      enableLogging: false
    };

    global.logger = require('./../engine/logger');
  });

  beforeEach(function() {
    global.packages = new PackageManager();
  });

  describe('PackageManager', function() {
    it('should have packages in config added when instantiated', function() {
      assert(global.packages.packages.has('foo'));
    });

    describe('addPackage()', function() {
      it('should add a package', function() {
        global.packages.addPackage('bar');
        assert(global.packages.packages.has('bar'));
      });
    });

    describe('Watcher', function() {
      let watcher;

      beforeEach(function() {
        watcher = new Watcher();
      });

      afterEach(function() {
        watcher.stop();
      });

      it('should add package to all watchers', function() {
        global.packages.addWatcher(watcher);
        global.packages.addPackage('bar');
        assert(watcher.packages.has('bar'));
      });

      describe('addWatcher()', function() {
        it('should add a watcher', function() {
          global.packages.addWatcher(watcher);
          assert(global.packages.watchers.has(watcher));
        });

        it('should add all packages to watcher', function() {
          global.packages.addWatcher(watcher);
          assert(watcher.packages.has('foo'));
        });
      });
    });
  });
});
