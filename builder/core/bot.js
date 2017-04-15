const Session = require('./session');
const Dialog = require('./dialog');

class Bot {
  constructor({ recognizer, connector }) {
    this.recognizer = recognizer;
    this.connector = connector;
    this.connector.on('receive-message', message => this.processMessage(message));
    this.actions = [];
    this.intents = [];
    this.sessions = [];
    this.dialogs = {};
    this.middlewares = [];

    return this;
  }

  processMessage(message) {
    console.log(`Bot::processMessage  ${JSON.stringify(message)}`);

    const userId = message.address.user.id;
    let session = this.findSession(message.address); // { userId, channelId });

    let promise = () => Promise.resolve({});
    if (!session) {
      console.log('get new user');
      promise = () => this.connector.getUser(message.address).then((userData) => {
        // console.log('create new session');
        // console.log(userData);
        session = new Session({ userId, bot: this, userData });
        this.sessions.push(session);
        return null;
      });
    }

    return promise().then(() => {
      // console.log(JSON.stringify(session));
      session.message = message;

      // run all receive middlewares
      let middlewaresStep = 0;

      const goToNext = () => {
        middlewaresStep += 1;
        return () => {
          if (typeof this.middlewares[middlewaresStep] === 'function') {
            this.middlewares[middlewaresStep](session, goToNext());
          } else {
            console.log('Bot::processMessage middlewares ended: lastNext execated');
            lastNext();
          }
        };
      };

      const lastNext = () => {
        // todo recognizer send request
        if (!this.checkActions(session, message)) {
          session.startConversation(message);
        }
      };

      if (this.middlewares.length) {
        console.log(`Bot::processMessage middlewares is runned (count: ${this.middlewares})`);
        this.middlewares[0](session, goToNext());
      } else {
        lastNext();
      }
    });
  }

  listen() {
    return this.connector.listen();
    // return this.connector.listen.apply(this);
  }

  // todo
  checkActions(session, message) {
    if (2 === 1) {
      // session.beginDialog(dialogName);
      return true;
    }
    return false;
  }

  // todo
  addActions(regexp, dialogName) {
    this.actions.push({});
  }

  findSession({ user, userId, channelId }) {
    if (!userId) {
      userId = user.id;
    }
    // console.log(userId, channelId);
    // console.log(this.sessions);
    return this.sessions.filter(session => session.userId === userId/* && session.message.channelId === channelId*/).pop();    
  }

  findSessionByUserId(userId) {
    return this.sessions.filter(session => session.userId === userId).pop();
  }

  dialog(dialogName, dialogsOrDialog) {
    const dialogs = Array.isArray(dialogsOrDialog) ? dialogsOrDialog : [dialogsOrDialog];
    this.dialogs[dialogName] = new Dialog({ dialogs, bot: this, dialogName });
    return this.dialogs[dialogName];
  }

  use(middlewares) {
    if (middlewares.receive || typeof middlewares === 'function') {
      this.middlewares.push(middlewares.receive || middlewares);
    }
  }

  addActions(regexp, dialogName) {

  }

  addIntent(name, dialogName) {

  }
}

module.exports = Bot;
