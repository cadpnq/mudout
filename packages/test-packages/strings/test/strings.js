describe('Strings', function() {
  beforeEach(function() {
    const config = {
      packageRoots: {
        core: 'packages'
      },
      packages: [
        'core:engine',
        'core:test-packages/strings'
      ],
      packageRoot: 'packages',
      enableLogging: false
    };
    global.engine.start(config);
  });

  afterEach(function() {
    global.engine.stop();
  });

  describe('get', function() {
    it('should return the value of known strings', function() {
      assert.equal(global.systems.strings.get('test-string'), 'foobar');
    });

    it('should return an empty string on unknown ones', function() {
      assert.equal(global.systems.strings.get('asdfasdf'), '');
    });
  });

  describe('hotload', function() {
    it('should change value when the object is changed', function() {
      assert.equal(global.systems.strings.get('test-string'), 'foobar');

      global.objects.load('', {
        type: 'instance',
        of: 'string',
        name: 'test-string',
        instanceData: {
          value: 'bizbuz'
      }});

      assert.equal(global.systems.strings.get('test-string'), 'bizbuz');
    });
  });
});
