const watcher = require('./watcher');
const misc = require('./misc');

function parseArgs(command, keywords = [], argumentNames = [], argumentKeywords = []) {
  let words = command.split(/\s/);
  let ret = {
    command: words.shift(),
    keywords: {},
    arguments: {},
    argumentKeywords: {},
    wholeArgument: words.join(' '),
    freeArgument: ''};
  words.reverse();
  let argumentValue = [];
  for (let word of words) {
    let _word = word.toLowerCase();

    if (argumentNames.includes(_word)) {
      argumentValue.reverse();
      ret.argumentKeywords[_word] = {};
      ret.arguments[_word] = [];
      for (word2 of argumentValue) {
        let _word2 = word2.toLowerCase();
        if (argumentKeywords[_word] && argumentKeywords[_word].includes(_word2)) {
          ret.argumentKeywords[_word][_word2] = true;
        } else {
          ret.arguments[_word].push(word2);
        }
      }
      ret.arguments[_word] = ret.arguments[_word].join(' ');
      argumentValue = [];
    } else {
      argumentValue.unshift(word);
    }
  }

  argumentValue.reverse();
  let freeArgument = [];
  for (let word of argumentValue) {
    let _word = word.toLowerCase();
    if (keywords.includes(_word)) {
      ret.keywords[_word] = true;
    } else {
      freeArgument.push(word);
    }
  }
  ret.freeArgument = freeArgument.join(' ');

  return ret;
}

class CommandContext {
  constructor(name) {
    this.commands = new Map();
    this.regexes = new Map();
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

    for (let name in commands) {
      let {func, keywords, argumentNames, argumentKeywords} = commands[name];
      this.commands.set(name, (session, context, text) => {
        before(session, context);
        if(!func(session, context, parseArgs(text, keywords, argumentNames, argumentKeywords))) {
          after(session, context);
        }
      });
    }
  }

  find(name) {
    let matches = [];
    for (let [command, _] of this.commands.entries()) {
      if (this.strict) {
        if (name == command) {
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
}

class ContextInstance {
  constructor(user, context) {
    this.contextVariables = {};
    this.user = user;
    this.context = context;
    this.parentContext;
  }

  extendTo(context) {
  }

  find(name) {
    let matches = this.context.find(name);
    if (this.context.traverse && this.parentContext) {
      return matches.concat(this.parentContext.match(name));
    } else {
      return matches;
    }
  }

  get(name) {
    let func = this.context.get(name);
    if (func) {
      return func;
    } else if (this.context.traverse && this.parentContext) {
      return this.parentContext.get(name);
    }
  }

  exec(s, text) {
    let command = text.split(' ')[0];
    let args = '';
    if (text.indexOf(' ')) {
      args = text.slice(text.indexOf(' ') + 1);
    }

    let commands = this.find(command);
    if (commands.length == 0) {
      return; // this is an unknown command situation
    } else if (commands.length != 1) {
      return; // this is an ambigious command situation
    }

    let func = this.get(commands[0]);
    if (!func) {
      return;
    }
    func(s, this, args);
  }

  enter(session) {
    this.context.enter(session, this);
  }

  exit(session) {
    this.context.exit(session, this);
  }
}

class CommandManager extends watcher {
  constructor() {
    super('commands');
    this.contexts = new Map();
  }

  load(path, data) {
    if (!data) {
      global.logger.info(`Loading commands: ${path}`);
      data = misc.requireReload(`./../${path}`);
    }

    let context = this.contexts.get(data.name);
    if (!context) {
      context = new CommandContext(data.name);
      this.contexts.set(data.name, context);
    }
    context.load(data);
  }
}

CommandManager.parseArgs = parseArgs;
module.exports = CommandManager;
