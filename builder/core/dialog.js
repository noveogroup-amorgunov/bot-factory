class Dialog {
  constructor({ dialogs, bot, dialogName }) {
    this.cards = dialogs;
    this.bot = bot;
    this.dialogName = dialogName;
    this.currentStep = 0;
    this.notRunNextStepImmediately = false;
  }

  exucate(session) {
    console.log(`Dialog::exucate - this.currentStep: ${this.currentStep}, this.cards.length ${this.cards.length}`);

    // end current dialog, if cards is ended
    if (this.currentStep > this.cards.length - 1) {
      this.currentStep = 0;
      session.endDialog();
      return;
    }

    // if (this.currentStep !== 0 && this.cards[this.currentStep + 1]) {
    //   this.currentStep += 1;
    //   this.cards[this.currentStep](session, this.goToNextCard(session));
    // } else {
      // let goToNextFunc = this.goToNextCard(session);
      // if (this.currentStep >= this.cards.length - 1) {
      //   goToNextFunc = session.endDialog;
      // }
    this.cards[this.currentStep](session, this.goToNextCard(session));
    this.currentStep += 1;

      // if (this.currentStep >= this.cards.length - 1) {
      //   this.currentStep += 1;
      // }
    // }
  }

  goToNextCard(session, _currentStep) {
    const currentStep = _currentStep || this.currentStep + 1;
    return () => {
      this.currentStep += 1;
      if (typeof this.cards[currentStep] === 'function') {
        this.cards[currentStep](session, this.goToNextCard(session, currentStep + 1));
      } else if (!this.notRunNextStepImmediately) {
        console.log('end dialog execated');
        // currentStep = 0;
        session.endDialog();
      }/* else {
        this.currentStep -= 1;
      }*/
    };
  }

  triggerAction(regexp) {
    this.bot.addActions(regexp, this.dialogName);
  }

  triggerIntent(name) {
    this.bot.addIntent(name, this.dialogName);
  }
}

module.exports = Dialog;
