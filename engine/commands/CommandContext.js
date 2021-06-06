const ContextInstance = require('./ContextInstance');
const parseArgs = require('./parseArgs');

module.exports = class CommandContext {
  commands = new Map();
  regexes = new Map();
  
  constructor(name) {
    this.name = name;
  }

  load({name, commands, traverse, strict, enter = () => {}, exit = () => {}, before = () => {}, after = () => {}}) {
    this.commands = new Map();
    this.traverse = traverse;
    this.strict = strict;
    this.enter = enter;
    this.exit = exit;
    this.before = before;
    this.after = after;

    for (const name in commands) {
      const {func, keywords, argumentNames, argumentKeywords} = commands[name];
      this.commands.set(name, (session, context, text) => {
        before(session, context);
        if(!func(session, context, parseArgs(text, keywords, argumentNames, argumentKeywords))) {
          after(session, context);
        }
      });
    }
  }

  find(name) {
    const matches = [];
    for (const [command, _] of this.commands.entries()) {
      if (this.strict) {
        if (name === command) {
          matches.push(command);
        }
      } else {
        if (command.startsWith(name.toLowerCase())) {
          matches.push(command);
        }
      }
    }
    return matches;
  }

  get(name) {
    return this.commands.get(name);
  }

  newInstance(user) {
    return new ContextInstance(user, this);
  }
};