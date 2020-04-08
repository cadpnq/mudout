let GameString = (extend) => {
  return class GameString extends extend {
    constructor() {
      super();
    }

    static initialize(data) {
      super.initialize(data);
      this.defineInstanceVariable('value', {value: ''});
    }

    modify(data) {
      super.modify(data);
      this.register('strings');
    }

  }
};

GameString.priority = 100;
module.exports = GameString;
