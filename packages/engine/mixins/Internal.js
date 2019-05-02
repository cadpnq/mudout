let Internal = (extend) => {
  class Internal extends extend {
  }
  return Internal;
};

module.exports = Internal;
module.exports.priority = 50;
