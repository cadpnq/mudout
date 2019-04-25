const engine = require('./../engine/engine');

let TestMixin = (extend) => {
  return class TestMixin extends extend {
    static initialize(data) {
      super.initialize(data);
      this.defineStaticVariable('foo', {value: 0});
      this.defineInstanceVariable('bar', {value: 1});
    }
  }
};

describe('Objects', function() {
  beforeEach(function() {
    let config = {
      packages: [
      ],
      enableLogging: false
    };
    engine.start(config, false);
  });

  describe('ObjectManager', function() {
    describe('defineMixin()', function() {
      it('should define a mixin', function() {
        global.objects.defineMixin('TestMixin', TestMixin);
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
});
