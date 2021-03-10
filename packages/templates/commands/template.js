module.exports = {
  name: 'context-name',
  commands: {
    name: {
      func: (session, context, args) => {},
      keywords: [],
      argumentNames: [],
      argumentKeywords: {}
    }
  },
  traverse: false,
  strict: false,
  enter: (session, context) => {},
  exit: (session, context) => {},
  before: (session, context) => {},
  after: (session, context) => {}
};
