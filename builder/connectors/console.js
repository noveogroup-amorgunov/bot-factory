const readline = require('readline');
const EventEmitter = require('events');
const Message = require('../core/message');

class ConsoleConnector extends EventEmitter {
  processMessage() {}

  getUser() {
    return Promise.resolve(this._getUser());
  }

  _getUser() {
    return {
      id: 'user',
      name: 'Console User'
    };
  }

  send(message) {
    // console.log('ConsoleConnector::send');
    console.log(message);
  }

  listen() {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.on('line', (line = '') => {
      if (line.toLowerCase() === 'quit') {
        rl.close();
        process.exit();
      }

      const msg = new Message()
        .address({
          channelId: 'console',
          user: this._getUser(),
          // bot: { id: 'bot', name: 'Bot' },
          // conversation: { id: 'Convo1' }
        })
        .timestamp()
        .text(line);

      this.emit('receive-message', msg);
    });

    return this;
  }
}

module.exports = ConsoleConnector;
