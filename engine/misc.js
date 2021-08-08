const fs = require('fs');
const path = require('path');

exports.time = (start) => {
  if (start) {
    const time = process.hrtime(start);
    return time[0] / 1000 + time[1] / 1000000;
  } else {
    return process.hrtime();
  }
};

function walkSync(dir, files = []) {
  if (fs.existsSync(dir)) {
    for (let file of fs.readdirSync(dir)) {
      file = path.join(dir, file);
      if (fs.statSync(file).isDirectory()) {
        files = walkSync(file, files);
      } else {
        files.push(file);
      }
    }
  }
  return files;
}
exports.walkSync = walkSync;

exports.requireReload = (modulePath) => {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
};
