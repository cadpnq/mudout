module.exports = {
  name: 'dashboard',
  commands: {},
  traverse: false,
  strict: false,
  enter: (session, context) => {
    session.register('statistics');
  },
  exit: (session, context) => {},
  before: (session, context) => {},
  after: (session, context) => {}
};
