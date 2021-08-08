module.exports = {
  name: 'attribute',
  priority: 15,
  interval: 500,
  each: (obj, t) => {
    if (obj.func) {
      obj.nextValue = obj.func(obj.object);
    } else {
      obj.nextValue = obj.baseValue + obj.instanceModifier;
    }

    if (obj.rate) {
      obj.nextValue += obj.object.attributes.get(obj.rate).value * (t / 1000);
    }

    let min = -Infinity;
    let max = Infinity;
    if (obj.minimum) {
      min = obj.object.attributes.get(obj.minimum).value;
    }
    if (obj.maximum) {
      max = obj.object.attributes.get(obj.maximum).value;
    }

    if (obj.nextValue < min) {
      obj.nextValue = min;
    } else if (obj.nextValue > max) {
      obj.nextValue = max;
    }

    if (obj.value !== obj.nextValue) {
      obj.object.register('attributes');
      obj.active = true;
    } else {
      obj.active = false;
    }
  }
};
