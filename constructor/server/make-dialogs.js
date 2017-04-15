const bot = require('./bot');
const _ = require('lodash');
const cardBuilder = require('./cards/builder');
const apiai = require('apiai');


const app = apiai('c46903db9fa74821baae79ab1688b986');

function someAwesomeRecognizer(sessionId, msg) {
  return new Promise((resolve, reject) => {
    const request = app.textRequest(msg, { sessionId });

    request.on('response', resolve);
    request.on('error', reject);
    request.end();
  });
}

function makeDialogs(doc) {
  // todo reset bot dialogs
  bot.reset();

  bot.use((session, next) => {
    if (session.message.text === 'reset') {
      bot.reset(true);
    }
    next();
  });

  bot.use({
    receive(session, next) {
      const msg = session.message.text; // 'I want order large pizza with tomato'
      const sessionId = session.userId;

      if (session.callstack.length !== 0) {
        next();
        return;
      }

      someAwesomeRecognizer(sessionId, msg)
      .then((response) => {
        console.log(response);
        const intent = response.result.action;

        if (intent === 'smalltalk.greeting') {
          session.send(response.result.fulfillment.speech);
          return;
        }

        // todo find intent in dialogs
        const action = bot.actions.filter(action => action.name === intent).pop();
        console.log(action);
        if (action) {
          session.beginDialog(action.dialogName);
        }

        // else send just message from apiai
        session.send(response.result.fulfillment.speech);
        

        // if (results && results.intent) {
        //   session.clearDialogsStack();
        //   session.beginDialog(intent.name);
        // }
        // next();
      }).catch(error => console.error(error));
    }
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
    if (d.intent) {
      d.triggerIntent(d.intent);
    }
  });

  // console.log(bot.dialogs);
}


module.exports = makeDialogs;
