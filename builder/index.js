const Bot = require('./core/bot');
const ConsoleConnector = require('./connectors/console');
const VKConnector = require('./connectors/vk');
const apiai = require('./recognizers/apiai');


module.exports = {
  Bot,
  connectors: {
    Vk: VKConnector,
    Console: ConsoleConnector,
  },
  recognizers: {
    apiai
  }
};
