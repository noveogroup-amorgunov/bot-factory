const builder = require('vk-bot-builder');

const waferfalls = [
  (session) => {
    builder.Prompts.text(session, "Hello... What's your name?");
  },
  (session, results) => {
    session.userData.name = results.response;
    builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
  },
  function (session, results) {
      session.userData.coding = results.response;
      builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
  },
  function (session, results) {
      session.userData.language = results.response.entity;
      session.send("Got it... " + session.userData.name + 
                   " you've been programming for " + session.userData.coding + 
                   " years and use " + session.userData.language + ".");
  }
];

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.Bot(connector, waferfalls)


bot.connect(process.env.BOT_TOKEN, {})

bot.command('/start', (session) => {
  const uid = session.user_id;

  session.send('Hello, this is /start command!');
  // bot.send(uid, 'Hello, this is /start command!');
});

bot.command('/me', (session) => {
  const uid = session.user_id;

  api('users.get', { user_id: uid }).then(body => {
    const user = body.response[0];

    bot.send(uid, `You are ${user.first_name} ${user.last_name}.`, 'wall145003487_1900');
  });
});