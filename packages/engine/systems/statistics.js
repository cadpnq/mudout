module.exports = {
  name: 'statistics',
  priority: 0,
  interval: 500,
  before(system) {
    const data = {};
    const systemData = [];
    let systemsTotal = 0;
    for (const [name, system] of global.systems.systems) {
      const line = [
        name,
        system.priority.toString(),
        system.interval.toString(),
        system.objects.size.toString(),
        (system.totalTime / 5).toPrecision(2).toString()
      ];
      systemsTotal += system.totalTime;
      system.totalTime = 0;
      systemData.push(line);
    }

    data.systems = systemData;
    data.uptime = process.uptime();
    data.systemsTotal = systemsTotal;
    data.instances = global.objects.instances.size;
    data.waitTime = global.systems.waitTime;
    data.mem = process.memoryUsage();
    this.data = data;
  },
  each(obj, t) {
    obj.emit('statistics', this.data);
  }
};
