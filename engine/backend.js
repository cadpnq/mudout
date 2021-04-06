const fs = require('fs');
const ipc = require('node-ipc');
const yaml = require('js-yaml');
const engine = require('./engine');

const yargs = require('yargs')
  .default('config', 'config.yaml')
  .alias('c', 'config')
  .version(false)
  .argv;

engine.start(yaml.load(fs.readFileSync(yargs.config)));

ipc.config.id = 'core';
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.config.maxConnections = 1000;

ipc.serve(() => {
  ipc.server.on('connect', (socket) => {
    socket.session = global.objects.new('session', socket);
  });

  ipc.server.on('socket.disconnected', (socket) => {
    socket.session.delete();
  });

  ipc.server.on('text/suppress', (type, socket) => {
    socket.session.suppressedText.add(type);
  });

  ipc.server.on('session/mode', (mode, socket) => {
    socket.session.mode = mode;
  });

  ipc.server.on('session/start', (_, socket) => {
    socket.session.start();
  });

  ipc.server.on('command', (command, socket) => {
    socket.session.exec(command);
  });
});

global.logger.info('Starting backend interface');
ipc.server.start();
