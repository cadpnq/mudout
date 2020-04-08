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
global.testConfig = yaml.safeLoad(fs.readFileSync(yargs.config));

let mocha = new Mocha();

for (let file of misc.walkSync('test')) {
  mocha.addFile(file);
}

for (let rootName in testConfig.packageRoots) {
  for (let file of misc.walkSync(testConfig.packageRoots[rootName])) {
    if (path.dirname(file).endsWith('test')) {
      mocha.addFile(file);
    }
  }
}

mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;
});
