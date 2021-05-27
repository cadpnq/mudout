const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chai = require('chai/register-assert');
const misc = require('./engine/misc');

const yargs = require('yargs')
  .default('config', 'config.yaml')
  .alias('c', 'config')
  .version(false)
  .argv;

global.engine = require('./engine/engine');
global.testConfig = yaml.load(fs.readFileSync(yargs.config));

const mocha = new Mocha(yaml.load(fs.readFileSync('.mocharc.yml')));

for (const file of misc.walkSync('test')) {
  mocha.addFile(file);
}

for (const rootName in testConfig.packageRoots) {
  for (const file of misc.walkSync(testConfig.packageRoots[rootName])) {
    if (path.dirname(file).endsWith('test')) {
      mocha.addFile(file);
    }
  }
}

mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;
});
