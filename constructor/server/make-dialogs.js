const bot = require('./bot');
const _ = require('lodash');
const cardBuilder = require('./cards/builder');


function makeDialogs(doc) {
  // reset bot dialogs
  bot.reset();

  // reset services middleware
  bot.use((session, next) => {
    if (session.message.text === 'reset') {
      bot.reset(true);
    }
    next();
  });

  // make builder cards function
  doc.dialogs.forEach((dialog) => {
    // console.log(dialog.cards);
    dialog.cards = dialog.cards.map((card, index) => {
      if (index === dialog.cards.length - 1) {
        card.isLast = true;
      }
      return card;
    });

    const d = bot.dialog(dialog.title, _.reduce(dialog.cards, cardBuilder, []));
    // console.log(dialog);
    if (dialog.intent) {
      d.triggerIntent(dialog.intent);
    }
  });

  // console.log(bot.dialogs);
}


module.exports = makeDialogs;
