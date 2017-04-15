require('dotenv-extended').load();

const restify = require('restify');
const request = require('request');
const Bot = require('./core/bot');
const ConsoleConnector = require('./connectors/console');
const VKConnector = require('./connectors/vk');

const server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());


// Create console connector and listen to stdin for messages
const connector = new ConsoleConnector().listen();
// const connector = new VKConnector({ token: process.env.VK_APP_TOKEN });

// Create your bot with a function to receive messages from the user
const bot = new Bot({ connector });

// const recognizer = new Bot.Recognizer('apiai');

const getParams = o => Object.keys(o).map(key => `${key}=${encodeURIComponent(o[key])}`).join('&');

const requestPromise = (url, params = false) => {
  const paramsString = params ? getParams(params) : '';
  const urlWithParams = `${url}?${paramsString}`;

  // console.log(urlWithParams);
  return new Promise((resolve, reject) => {
    request.get(urlWithParams, (error, response, body) => {
      const { statusCode } = response;
      // handle error
      if (error || statusCode < 200 || statusCode > 299) {
        reject(new Error(`Failed to load page with status code: ${response.statusCode}`));
      }
      resolve(body);
    });
  });
};


// card types:
//    text
//    user-question
//    dialog-question
//    json-api
//    image
//    pause

const answers = [{
  text: 'Yes',
  dialog: 'help'
}, {
  text: 'No',
  dialog: null
}];

bot.dialog('entry', [(session, next) => {
  const username = `${session.getUsername()}`;

  session.send(`--------> Hello, ${username}!`);
  session.send('--------> I\'m pizza bot! 🍕 🦄');
  next();
}, (session, next) => {
  requestPromise('https://api.myjson.com/bins/15kh8z').then((body) => {
    session.send(JSON.parse(body).data);
  });
}, (session, next) => {
  // session.sendQuestion('What is your city?', ['yes', 'no']);
  session.sendQuestion('Are you human?', answers);
  // session.send('--------> waterfall dialogs is working 1?');
}, (session, next) => {
  // console.log(session);
  // todo find answer by text (not only index)
  const index = session.results;
  const answer = answers[index];
  // console.log(index, answer);
  if (answer && answer.dialog) {
    session.beginDialog(answer.dialog);
    return;
  }
  next();
  // session.sendQuestion('What is your city?', ['yes', 'no']);
  // session.sendQuestion('What is your city?', ['yes', 'no']);
  // session.send('--------> waterfall dialogs is working 1?');
}, (session, next) => {
  session.send('--------> waterfall dialogs is working 2?', ['yes', 'no']);
}, (session, next) => {
  session.send('--------> waterfall dialogs is working without calling next function!');
  session.beginDialog('help');
}, (session, next) => {
  session.send('--------> return in entry dialog');
}]);

bot.dialog('help', [(session, next) => {
  session.send(`--------> You can ask me about something, I try to answer and help you!`);
}, (session, next) => {
  session.send('--------> Ohh, I don\'t now, sorry', ['yes', 'no']);
}]);

// bot.use((session, next) => {
//   session.send(`> You said: ${session.message.text}`);
//   next();
// });

// server.listen(3978, () => console.log('%s listening to %s', server.name, server.url));
// server.post('/api/messages', bot.listen());
// server.post('/api/messages', (req, res) => (res.end('5365dd58')));






// bot.dialog('entry', [(session, next) => {
//   const username = `${session.user.first_name} ${session.user.last_name}`;

//   session.send(`Hello, ${username}!`);
//   session.send('I\'m pizza bot! 🍕 🦄');
//   next();
// }, (session, next) => {
//   session.send('waterfall dialogs is working!');
// }, (session, next) => {
//   session.send('waterfall dialogs is working without calling next function!');
//   // session.sendQuestion('What is your city?');
// }]);

// bot.dialog('help', (session, next) => {
//   session.send(`I'm pizza bot, you can ask about me or order pizza!`);
// }).triggerAction(/\!?help/gi);

// bot.dialog('help2', (session, next) => {
//   session.send(`I'm pizza bot, you can ask about me or order pizza!`);
// }).triggerIntent('help');


// bot.use({
//   receive(session, next) {
//     const msg = session.message; // 'I want order large pizza with tomato'
//     const sessionId = session.userId;

//     someAwesomeRecognizer(sessionId, msg)
//     .then((results) => {
//       if (results && results.intent) {
//         session.clearDialogsStack();
//         session.beginDialog(intent.name);
//       }
//       next();
//     });
//   }
// });
