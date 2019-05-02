let fs = require('fs');
let yaml = require('js-yaml');

module.exports = {
  name: 'persist',
  priority: 15,
  interval: 5000,
  each: (obj, t) => {
    if (obj.dirty) {
      fs.writeFileSync(`${global.config.instancePath}/${obj.uid}`, yaml.safeDump(obj.save()));
      obj.dirty = false;
    }
  }
};
