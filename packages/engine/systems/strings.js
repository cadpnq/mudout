module.exports = {
  name: 'strings',
  priority: -1,
  interval: Infinity,
  indexBy: 'uid',
  get(name) {
    if (this.index.has(name)) {
      return this.index.get(name).value;
    } else {
      return '';
    }
  }
};
