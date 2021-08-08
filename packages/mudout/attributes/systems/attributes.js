module.exports = {
  name: 'attributes',
  priority: 16,
  interval: 500,
  each: (obj, t) => {
    let anyActive = false;
    for (const [, attribute] of obj.attributes) {
      if (attribute.nextValue !== attribute.value) {
        anyActive = true;
        attribute.value = attribute.nextValue;
      } else {
        attribute.active = false;
      }
      if (!anyActive) {
        obj.unregister('attributes');
      }
    }
  }
};
