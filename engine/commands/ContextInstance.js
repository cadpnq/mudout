module.exports = class ContextInstance {
  contextVariables = {};
  parentContext;

  constructor(user, context) {
    this.user = user;
    this.context = context;
  }

  extendTo(context) {}

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
    if (commands.length === 0) {
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
};
