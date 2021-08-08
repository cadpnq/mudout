const misc = require('./../misc');

module.exports = class System {
  objects = new Set();
  index = new Map();
  indexBy = '';
  priority = 0;
  interval = 0;
  elapsed = 0;
  name;
  totalTime = 0;

  each(obj, t) {}

  before(t) {}

  after(t) {}

  update(t) {
    this.elapsed = 0;

    const totalStart = misc.time();

    this.before(this, t);
    for (const obj of this.objects) {
      this.each(obj, t);
    }
    this.after(this, t);

    this.totalTime += misc.time(totalStart);
  }

  register(obj) {
    this.objects.add(obj);
    if (this.indexBy) {
      this.index.set(obj[this.indexBy], obj);
    }
  }

  unregister(obj) {
    this.objects.delete(obj);
    if (this.indexBy) {
      this.index.delete(obj[this.indexBy]);
    }
  }
};
