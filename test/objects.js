const engine = require('./../engine/engine');

const TestMixin = (extend) => {
  return class TestMixin extends extend {
  };
};

describe('ObjectManager', function() {
  beforeEach(function() {
    const config = {
      packages: [
      ],
      enableLogging: false
    };
    engine.start(config, false);
  });

  afterEach(function() {
    engine.stop();
  });

  describe('addMixin()', function() {
    it('should add a mixin', function() {
      global.objects.addMixin(TestMixin);
      assert(global.objects.mixins.has('TestMixin'));
    });
  });

  describe('defineType()', function() {
    it('should define a type', function() {
      global.objects.defineType('foo', 'bar');
      assert(global.objects.typeDefinitions.has('foo'));
      assert(global.objects.typeDefinitions.get('foo').includes('bar'));
    });

    it('should ammend a definition of an already defined type', function() {
      global.objects.defineType('foo', 'bar');
      global.objects.defineType('foo', 'buz');
      assert(global.objects.typeDefinitions.get('foo'), ['bar', 'buz']);
    });
  });
});
