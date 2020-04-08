const CommandManager = require('./../engine/commands');
const parseArgs = CommandManager.parseArgs;

function get(command) {
  return parseArgs(command, ['all'], ['from'], {from: ['all']});
}

describe('Commands', function() {
  describe('parseArgs', function() {
    describe('get', function() {
      it('should return the command', function() {
        assert.include(get('get foo'), {command: 'get'});
      });

      it('should accept keywords', function() {
        assert.deepInclude(get('get all foo'), {keywords: {all: true}});
      });

      it('should accept arguemnts', function() {
        assert.deepInclude(get('get foo from bar'), {arguments: {from: 'bar'}});
      });

      it('should accept argument keywords', function() {
        assert.deepInclude(get('get foo from all bar'), {argumentKeywords: {from: {all: true}}});
      });

      it('should return all arguments', function() {
        assert.include(get('get foo'), {wholeArgument: 'foo'});
        assert.include(get('get all foo'), {wholeArgument: 'all foo'});
        assert.include(get('get all foo from bar'), {wholeArgument: 'all foo from bar'});
        assert.include(get('get all foo from all bar'), {wholeArgument: 'all foo from all bar'});
      });

      it('should accept free arguments', function() {
        assert.include(get('get foo'), {freeArgument: 'foo'});
        assert.include(get('get bar'), {freeArgument: 'bar'});
      });
    });
  });
});
