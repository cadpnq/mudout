describe('Simple Objects', function() {
  beforeEach(function() {
    let config = {
      packageRoots: {
        core: 'packages'
      },
      packages: [
        'core:engine',
        'core:test-packages/simple-objects'
      ],
      packageRoot: 'packages',
      enableLogging: false
    };
    global.engine.start(config);
  });

  afterEach(function() {
    global.engine.stop();
  });

  describe('Internal Objects', function() {
    it('should exist when type is loaded', function() {
      assert(global.objects.objects.has('internal-simple-object'));
    });

    it('should have default values on variables', function() {
      let obj = global.objects.new('internal-simple-object');
      assert.equal(obj.staticVar, 0);
      assert.equal(obj.instanceVar, 1);
    });
  });

  describe('External Objects', function() {
    it('should exist when object definition is loaded', function() {
      assert(global.objects.objects.has('a-simple-object'));
    });

    describe('Instances', function() {
      let obj, obj2;

      beforeEach(function() {
        // this data is the same as is on disk
        global.objects.load('', {
          name: 'A simple object',
          id: 'a-simple-object',
          type: 'simple-object',
          staticVar: 1
        });

        obj = global.objects.new('a-simple-object');
        obj2 = global.objects.new('a-simple-object');

        obj.instanceRef = obj2;
        obj2.instanceRef = obj;
      });

      afterEach(function() {
        obj.delete();
        obj2.delete();
      });

      it('should have default values from object definition', function() {
        assert.equal(obj.staticVar, 1);
        assert.equal(obj.instanceVar, 1);
      });

      it('should update statics on existing instances when object definition changes', function() {
        global.objects.load('', {
          name: 'A simple object',
          id: 'a-simple-object',
          type: 'simple-object',
          staticVar: 42
        });

        assert.equal(obj.staticVar, 42);
        assert.equal(obj2.staticVar, 42);
      });

      it('should have variables independent between instances', function() {
        assert.equal(obj.instanceVar, 1)
        obj.instanceVar = 2;
        assert.equal(obj.instanceVar, 2);
        assert.equal(obj2.instanceVar, 1);
      });

      describe('save()/load', function() {
        it('should save instance variables', function() {
          assert.include(obj.save().instanceData, {instanceVar: 1});

          obj.instanceVar = 2;
          assert.include(obj.save().instanceData, {instanceVar: 2});
        });

        it('should save references', function() {
          assert.equal(obj.save().references.instanceRef, obj2.uid);
        });

        it('should restore references when saved object is loaded', function() {
          let obj3 = global.objects.loadInstance(obj.save());
          assert.equal(obj3.instanceRef, obj2);
        });
      });
    });
  });

});
