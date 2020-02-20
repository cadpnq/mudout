let Internal = (extend) => {
  class Internal extends extend {
  }
  return Internal;
};

Internal.priority = 50;
module.exports = Internal;
