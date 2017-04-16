const _ = require('lodash');
const Dialog = require('./dialog');

class Session {
  constructor({ userId, bot, userData }) {
    this.userId = userId;
    this.bot = bot;
    this.message = null;
    this.dialogs = Object.keys(this.bot.dialogs).reduce((acc, key) => {
      const obj = this.bot.dialogs[key];
      const dialog = new Dialog({ dialogs: obj.cards, bot: this.bot, dialogName: obj.dialogName });
      acc[key] = dialog;
      return acc;
    }, {});

    this.isNew = true;

    this.callstack = [];

    this.sessionState = {
      version: 1,
      awaitAnswer: false,
      lastQuestionData: null
    };

    this.user = userData;
    this.user.data = {};

    this.data = {};
    this.results = null;
  }

  resetConversation() {
    this.send('Мои сервисы и функционал был обновлен. Начнем с начала!)');
    this.callstack = [];

    this.dialogs = Object.keys(this.bot.dialogs).reduce((acc, key) => {
      const obj = this.bot.dialogs[key];
      const dialog = new Dialog({ dialogs: obj.cards, bot: this.bot, dialogName: obj.dialogName });
      acc[key] = dialog;
      return acc;
    }, {});

    this.sessionState = {
      awaitAnswer: false,
      lastQuestionData: null,
      version: this.sessionState.version,
    };
    this.data = {};
    this.results = null;
    this.endConversation();

    console.log(this.dialogs);
  }

  getUsername() {
    if (this.user.name) {
      return this.user.name;
    } else if (this.user.first_name && this.user.last_name) {
      return `${this.user.first_name} ${this.user.last_name}`;
    }
    return 'Default user';
  }

  _parseMsg(message) {
    let msg = message;
    if (/{username}/i.test(msg)) {
      msg = msg.replace(/{username}/gi, this.getUsername());
    }
    const userAttributes = msg.match(/\{(.*?)\}/gi) || [];

    // console.log(msg, userAttributes, this.user.data);
    userAttributes
      .map(attribute => attribute.replace(/{/g, '').replace(/}/g, ''))
      .forEach((attributeName) => {
        if (attributeName !== 'username' && this.user.data[attributeName]) {
          msg = msg.replace(`{${attributeName}}`, this.user.data[attributeName] || '');
        }
      });
    return msg;
  }

  send(message) {
    // console.log('Session::send');
    // console.log(`message: ${message}`);
    this.isNew = false;
    this.bot.connector.send(this._parseMsg(message), this.user);
  }

  sendQuestion(message, data) {
    this.sessionState.awaitAnswer = true;
    this.sessionState.lastQuestionData = data;
    this.activeDialogs().notRunNextStepImmediately = true;

    if (Array.isArray(data)) {
      this.bot.connector.send(`${this._parseMsg(message)}: ${data.map((answer, index) => `\n${index}. ${answer.value}`).join('')}`, this.user);
    } else {
      this.bot.connector.send(this._parseMsg(message), this.user);
    }
  }

  clearDialogsStack() {
    this.callstack.length = 0;
  }

  receiveAnswer(answer) {
    const data = this.sessionState.lastQuestionData;
    // console.log(data);
    // lastQuestionData
    // console.log(answer);
    // console.log(data);
    this.sessionState.awaitAnswer = false;
    this.activeDialogs().notRunNextStepImmediately = false;

    // e.g.: "I want see a doctor" => "i want see doctor"
    const deleteArticles = msg => msg.replace(/ну |и |а |,|\.|! /gi, '').toLowerCase();
    const isEqualsString = (s1, s2) => deleteArticles(s1) === deleteArticles(s2);
    const hasSubstring = (s1, include) =>
      deleteArticles(s1).indexOf(deleteArticles(include)) !== -1;

    console.log(data, answer);

    const getAnswer = () => {
      if (+answer == answer && data[answer]) {
        return answer;
      } if (Array.isArray(data)) {
        let result = false;
        data.forEach((answ, index) => {
          if (hasSubstring(answer, answ.value)) {
            result = index;
          }
        });
        return result;
      }
      return false;
    };

    const returnedAnswer = getAnswer();

    if (typeof data === 'string') {
      this.user.data[data] = answer;
      this.sessionState.lastQuestionData = null;
      this.startConversation();
    } else if (typeof returnedAnswer !== 'undefined' && returnedAnswer !== false) {
      this.results = returnedAnswer;
      this.sessionState.lastQuestionData = null;
      this.startConversation();
    } else {
      this.send('Я тебя не понял. Выбери пожалуйста вариант из списка');
    }
  }

  activeDialogs() {
    console.log(`Session::activeDialogs length: ${this.callstack.length}`);
    const length = this.callstack.length;
    return length !== 0 && this.callstack[length - 1];
  }

  endDialog() {
    console.log('Session::endDialog');
    this.callstack.pop();
    // if (this.activeDialogs()) {
    this.startConversation();
    // }
  }

  startConversation(message = false) {
    console.log(`Session::startConversation  -  callstack: ${this.callstack.length}`);

    if (this.sessionState.version !== this.bot.version) {
      this.sessionState.version = this.bot.version;
      if (!this.isNew) {
        this.resetConversation();
        return;
      }
    }

    if (this.sessionState.awaitAnswer) {
      console.log('await answer');
      this.receiveAnswer(message.text);
      return;
    }

    const dialog = this.activeDialogs();
    console.log(`active dialog: ${dialog && dialog.dialogName}`);
    if (dialog) {
      dialog.exucate(this);
    } else {
      const dialogName = Object.keys(this.dialogs)[0];
      if (!dialogName) {
        console.warn('Dialogs not found');
        return;
        // throw new Error(`Dialog ${dialogName} isn't exist`);
      }
      if (this.bot.recognizer) {
        this.bot.connector.emit('receive-message', this.message);
      }
      // this.beginDialog(dialogName);
    }
  }

  replaceDialog() {
    throw new Error('Not implement yet');
  }

  sendError() {
    this.send('Что-то пошло не так, на сервере произошла ошибка, извините!');
  }

  endConversation(msg) {
    console.log('Session::endConversation');
    this.clearDialogsStack();
  }

  beginDialog(dialogName) {
    const dialog = this.dialogs[dialogName];
    if (!dialog) {
      throw new Error(`Dialog ${dialogName} isn't exist`);
    }
    this.callstack.push(dialog);
    // console.log(this.callstack);
    console.log(`goto ${dialog.dialogName}`);
    console.log(`Session::beginDialog  -  callstack length: ${this.callstack.length}`);
    dialog.exucate(this);
  }
}

module.exports = Session;
