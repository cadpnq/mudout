const rawipc = require('node-ipc').IPC;
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const tailFile = require('winston/lib/winston/tail-file');

const memScale = 1024;
const graphScale = 1024;
const graphWidth = 24;
let graphX = new Array(graphWidth);
graphX.fill(' ');

let usedData = new Array(graphWidth);
usedData.fill(0);
let totalData = new Array(graphWidth);
totalData.fill(0);
let rssData = new Array(graphWidth);
rssData.fill(0);

let systems = [];
let connected = false;
let uptime = '';
let load = '';
let objects = '';
let wait = '';

let ipc = new rawipc;
ipc.config.id = 'core';
ipc.config.retry = 1500;
ipc.config.silent = true;

let screen = blessed.screen({
  fullUnicode: true,
  forceUnicode: true,
  debug: true,
});

screen.key(['escape', 'q', 'C-c'], (ch, key) => (process.exit(0)));

let systemsTable = contrib.table({
  parent: screen,
  interactive: false,
  shrink: true,
  columnSpacing: 10,
  columnWidth: [10, 8, 8, 7, 8],
  border: 'line',
  width: '70%',
  height: '20%',
  label: 'Systems',
  fg: 'white',
});

let statusBox = blessed.box({
  parent: screen,
  label: 'Status',
  border: 'line',
  left: '70%',
  width: '30%',
  height: '20%',
});

let statusTable = blessed.table({
  parent: statusBox,
  align: 'left',
});

let memoryGraph = contrib.line({
  parent: screen,
  top: '20%',
  width: '100%',
  height: '20%',
  border: 'line',
  label: 'Memory',
  style: {
    text: 'white',
  },
  showLegend: true,
});

let log = blessed.log({
  parent: screen,
  top: '40%',
  width: '100%',
  height: '40%',
  border: 'line',
  label: 'Log',
});

tailFile({file: 'logs/log.log'}, (err, line) => {
  log.log(line.trim());
  screen.render();
});

screen.append(memoryGraph);

function draw() {
  systemsTable.setData({headers: ['name', 'priority', 'interval', 'objects', 'load'], data: systems});
  statusTable.setData([
    ['Connected:', connected ? 'YES': 'NO'],
    ['Uptime:', uptime],
    ['Load:', load],
    ['Objects:', objects],
    ['Wait: ', wait],
  ]);
  memoryGraph.setData([
   {title: 'heap used',
    x: graphX,
    y: usedData,
    style: { line: 'green' }},
   {title: 'heap total',
    x: graphX,
    y: totalData,
    style: { line: 'red' }},
   {title: 'rss',
    x: graphX,
    y: rssData,
    style: { line: 'magenta' }}
  ]);
  screen.render();
}

draw();
ipc.connectTo('core', () => {
  ipc.of.core.on('connect', () => {
    connected = true;
    ipc.of.core.emit('session/mode', 'dashboard');
    ipc.of.core.emit('session/start');
    draw();
  });

  ipc.of.core.on('disconnect', () => {
    connected = false;
    draw();
  });

  ipc.of.core.on('statistics', (data) => {
    systems = data.systems;
    uptime = data.uptime.toFixed().toString();
    load = (data.systemsTotal / 5).toPrecision(3).toString() + ' %';
    objects = data.instances.toString();
    wait = data.waitTime.toString();

    usedData.shift();
    totalData.shift();
    rssData.shift();
    usedData.push(data.mem.heapUsed / memScale);
    totalData.push(data.mem.heapTotal / memScale);
    rssData.push(data.mem.rss / memScale);
    draw();
  });
});
