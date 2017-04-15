module.exports = (acc, item) => {
  acc.push((session, next) => {
    session.send(item.text);
    !item.isLast && next();
  });
  return acc;
};
