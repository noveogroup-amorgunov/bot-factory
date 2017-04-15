const Bot = require('./core/bot');
const ConsoleConnector = require('./connectors/console');
const VKConnector = require('./connectors/vk');


module.exports = {
  Bot,
  connectors: {
    Vk: VKConnector,
    Console: ConsoleConnector,
  }
};
