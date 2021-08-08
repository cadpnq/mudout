module.exports = function parseArgs(
  command,
  keywords = [],
  argumentNames = [],
  argumentKeywords = []
) {
  const words = command.split(/\s/);
  const ret = {
    command: words.shift(),
    keywords: {},
    arguments: {},
    argumentKeywords: {},
    wholeArgument: words.join(' '),
    freeArgument: ''
  };
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
        if (
          argumentKeywords[_word] &&
          argumentKeywords[_word].includes(_word2)
        ) {
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
};
