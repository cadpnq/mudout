let Internal = (extend) => {
  return class Internal extends extend {
  }
};

Internal.priority = 50;
module.exports = Internal;
