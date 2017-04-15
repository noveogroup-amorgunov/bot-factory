module.exports = (acc, item) => {
  acc.push((session, next) => {
    session.sendQuestion(item.text, item.attribute);
  });
  return acc;
};
