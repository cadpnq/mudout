const watcher = require('./watcher');
const misc = require('./misc');

function parseArgs(command, keywords = [], argumentNames = [], argumentKeywords = []) {
  const words = command.split(/\s/);
  const ret = {
    command: words.shift(),
    keywords: {},
    arguments: {},
    argumentKeywords: {},
    wholeArgument: words.join(' '),
    freeArgument: ''};
  words.reverse();
  let argumentValue = [];
  for (const word of words) {
    const _word = word.toLowerCase();

    if (argumentNames.includes(_word)) {
      argumentValue.reverse();
      ret.argumentKeywords[_word] = {};
      ret.arguments[_word] = [];
      for (const word2 of argumentValue) {
        const _word2 = word2.toLowerCase();
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
  const freeArgument = [];
  for (const word of argumentValue) {
    const _word = word.toLowerCase();
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
  contextVariables = {};
  parentContext;

  constructor(user, context) {
    this.user = user;
    this.context = context;
  }

  extendTo(context) {
  }

  find(name) {
    const matches = this.context.find(name);
    if (this.context.traverse && this.parentContext) {
      return matches.concat(this.parentContext.match(name));
    } else {
      return matches;
    }
  }

  get(name) {
    const func = this.context.get(name);
    if (func) {
      return func;
    } else if (this.context.traverse && this.parentContext) {
      return this.parentContext.get(name);
    }
  }

  exec(s, text) {
    const command = text.split(' ')[0];
    let args = '';
    if (text.indexOf(' ')) {
      args = text.slice(text.indexOf(' ') + 1);
    }

    const commands = this.find(command);
    if (commands.length == 0) {
      return; // this is an unknown command situation
    } else if (commands.length !== 1) {
      return; // this is an ambigious command situation
    }

    const func = this.get(commands[0]);
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

module.exports = class CommandManager extends watcher {
  contexts = new Map();

  constructor() {
    super('commands');
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
};

module.exports.parseArgs = parseArgs;