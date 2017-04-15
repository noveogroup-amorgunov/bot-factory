require('dotenv-extended').load();

const restify = require('restify');
const { Bot, connectors, recognizers } = require('../../builder');

const server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Create console connector and listen to stdin for messages
// const connector = new ConsoleConnector().listen();
const connector = new connectors.Vk({ token: process.env.VK_APP_TOKEN });
const recognizer = recognizers.apiai;

// Create your bot with a function to receive messages from the user
const bot = new Bot({ connector, recognizer });

server.listen(3978, () => console.log('%s listening to %s', server.name, server.url));
server.post('/api/messages', bot.listen());

module.exports = bot;
