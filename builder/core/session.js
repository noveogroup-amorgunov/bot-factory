class Session {
  constructor({ userId, bot, userData }) {
    this.userId = userId;
    this.bot = bot;
    this.message = null;

    this.callstack = [];

    this.sessionState = {
      version: 0.1,
      awaitAnswer: false,
      lastQuestionData: null
    };
    this.user = userData;
    this.data = {};
    this.results = null;
  }

  resetConversation() {
    this.send('My services was updated!');
    this.endConversation();
  }

  getUsername() {
    if (this.user.name) {
      return this.user.name;
    } else if (this.user.first_name && this.user.last_name) {
      return `${this.user.first_name} ${this.user.last_name}`;
    }
    return 'Default user';
  }

  send(message) {
    // console.log('Session::send');
    // console.log(`message: ${message}`);
    this.bot.connector.send(message, this.user);
  }

  sendQuestion(message, data) {
    this.sessionState.awaitAnswer = true;
    this.sessionState.lastQuestionData = data;
    this.activeDialogs().notRunNextStepImmediately = true;
    this.bot.connector.send(message + ' \n(' + data.map((answer, index) => `${index}. ${answer.text}`).join(', ') + ')', this.user);
  }

  clearDialogsStack() {
    this.callstack.length = 0;
  }

  receiveAnswer(answer) {
    const data = this.sessionState.lastQuestionData;
    // lastQuestionData
    // console.log(answer);
    // console.log(data);
    if (+answer == answer && data[answer]) {
      this.sessionState.awaitAnswer = false;
      this.sessionState.lastQuestionData = null;
      this.activeDialogs().notRunNextStepImmediately = false;
      this.results = answer;
      this.startConversation();
    } else {
      this.send('I can\'t understand you. Choose please variant from list');
    }
  }

  activeDialogs() {
    console.log('Session::activeDialogs length:' + this.callstack.length);
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
      const dialogName = Object.keys(this.bot.dialogs)[0];
      if (!dialogName) {
        console.warn('Dialogs not found');
        return;
        // throw new Error(`Dialog ${dialogName} isn't exist`);
      }
      this.beginDialog(dialogName);
    }
  }

  replaceDialog() {
    throw new Error('Not implement yet');
  }

  endConversation(msg) {
    console.log('Session::endConversation');
    this.clearDialogsStack();
  }

  beginDialog(dialogName) {
    const dialog = this.bot.dialogs[dialogName];
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
