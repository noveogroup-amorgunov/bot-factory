require('dotenv-extended').load();
const Bot = require('../core/bot');
const ConsoleConnector = require('../connectors/console');

// Create console connector and listen to stdin for messages
const connector = new ConsoleConnector().listen();

// Create your bot with a function to receive messages from the user
const bot = new Bot({ connector });

bot.use((session, next) => {
  session.send(`> You said: ${session.message.text}`);
  next();
});
