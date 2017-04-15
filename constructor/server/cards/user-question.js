module.exports = (acc, item) => {
  acc.push((session, next) => {
    session.sendQuestion(item.text, item.answers);
  });

  acc.push((session, next) => {
    // todo find answer by text (not only index)
    const index = session.results;
    const answer = item.answers[index];
    if (answer && answer.dialog) {
      session.beginDialog(answer.dialog);
      return;
    }
    !item.isLast &&  next();
  });
  return acc;
};
