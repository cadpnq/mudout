describe('Attributes', function() {
  beforeEach(function() {
    const config = {
      packageRoots: global.testConfig.packageRoots,
      packages: [
        'core:engine',
        'mudout:attributes',
        'mudout:test-packages/attributes'
      ],
      enableLogging: false
    };
    global.engine.start(config);
  });

  afterEach(function() {
    global.engine.stop();
  });

  describe('AttributeTest', function() {
    let obj;
    beforeEach(function() {
      obj = global.objects.new('attributetest');
    });
    afterEach(function() {
      obj.delete();
    });

    describe('default values', function() {
      it('should have a value of 0', function() {
        assert.equal(obj.test, 0);
      });
      it('should have a minimum of 0', function() {
        assert.equal(obj.test_minimum, 0);
      });
      it('should have a maximum of 100', function() {
        assert.equal(obj.test_maximum, 100);
      });
      it('should have a rate of 0', function() {
        assert.equal(obj.test_rate, 0);
      });
    });

    describe('value bounds', function() {
      it('should not go larger than the maximum', function() {
        obj.test = 101;
        assert.equal(obj.test, obj.test_maximum);
      });
      it('should not go smaller than the minimum', function() {
        obj.test = -1;
        assert.equal(obj.test, obj.test_minimum);
      });
    });

    describe('rate', function() {
      it('should change with respect to the rate attribute', function() {
        obj.test = 0;
        obj.test_rate = 1;
        assert.equal(obj.test, 0);
        obj.forceAttributeUpdate(1000);
        assert.equal(obj.test, 1);
      });
    });

    describe('func', function() {
      it('should change when the parent attributes do', function() {
        assert.equal(obj.doubleTest, obj.test * 2);
        obj.test = 1;
        obj.forceAttributeUpdate(0);
        assert.equal(obj.doubleTest, obj.test * 2);
      });
    });

    describe('save/load', function() {
      it('should be able to save and load all attributes', function() {
        obj.test = 10;
        obj.test_rate = 10;
        const obj2 = global.objects.loadInstance(obj.save());
        assert.equal(obj.test, obj2.test);
        assert.equal(obj.test_rate, obj2.test_rate);
      });
    });

    describe('hotloading', function() {
      it('should update instances when the base values are modified', function() {
        assert.equal(obj.test, 0);
        global.objects.load('', {type: 'attributetest', id: 'attributetest', name: 'attributetest', attributes: {test: 10}});
        obj.forceAttributeUpdate(0);
        assert.equal(obj.attribute('test').baseValue, 10);
        assert.equal(obj.test, 10);
      });
    });
  });
});
