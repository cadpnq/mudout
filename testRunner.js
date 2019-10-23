const Mocha = require('mocha');
const path = require('path');
const chai = require('chai/register-assert');
const misc = require('./engine/misc');

let mocha = new Mocha();

for (let file of misc.walkSync('test')) {
  mocha.addFile(file);
}

for (let file of misc.walkSync('packages')) {
  if (path.dirname(file).endsWith('test')) {
    mocha.addFile(file);
  }
}

mocha.run(function(failures) {
  process.exitCode = failures ? 1 : 0;
});
