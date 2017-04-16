module.exports = (acc, item) => {
  if (!item.text) {
    return acc;
  }
  acc.push((session, next) => {
    session.send(item.text);
    !item.isLast && next();
  });
  return acc;
};
