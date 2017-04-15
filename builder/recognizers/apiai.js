const apiai = require('apiai');


const app = apiai(process.env.APIAI_TOKEN);

function apiaiRecognizer(sessionId, msg) {
  return new Promise((resolve, reject) => {
    const request = app.textRequest(msg, { sessionId });

    request.on('response', resolve);
    request.on('error', reject);
    request.end();
  });
}

// api ai recognizer
const handler = (session, next) => {
  const msg = session.message.text;
  const sessionId = session.userId;

  // if session haven't active dialogs or if user's message equals "reset"
  if (session.callstack.length !== 0 || session.message.text === 'reset') {
    next();
    return;
  }

  apiaiRecognizer(sessionId, msg)
  .then((response) => {
    console.log(response);
    const intent = response.result.metadata.intentName;

    if (intent === 'smalltalk.greeting') {
      session.send(response.result.fulfillment.speech);
      return;
    }

    // find intent in dialogs
    const action = session.bot.actions.filter(action => action.name === intent).pop();
    console.log(action);
    if (action) {
      if (!response.result.action || response.result.actionIncomplete === false) {
        session.parameters = response.result.parameters;
        session.beginDialog(action.dialogName);
        // next();
        return;
      }
    }

    // else send just message from apiai
    session.send(response.result.fulfillment.speech);
  }).catch(error => session.sendError(error));
};

module.exports = {
  handler
};
