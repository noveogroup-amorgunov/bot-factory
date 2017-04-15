require('app-module-path/register');
require('dotenv-extended').load();
require('./bot');

const mongoose = require('mongoose');
const Hapi = require('hapi');
const inert = require('inert');
const hapiBoomDecorators = require('hapi-boom-decorators');
const routes = require('./routes');
const DialogFlow = require('../../common/models/dialog-flow');
const makeDialogs = require('./make-dialogs');

mongoose.Promise = Promise;
mongoose.connect(process.env.DB_CONNECT);

const server = new Hapi.Server();

// Set the port for listening server
server.connection({
  host: process.env.CONSTRUCTOR_SERVER_HOST || 'localhost',
  port: process.env.CONSTRUCTOR_SERVER_PORT || '8081',
  routes: { cors: true }
});

const plugins = [
  inert, // register static file and directory routers
  hapiBoomDecorators, // decorate reply with Boom errors
];

server.register(plugins.concat(routes), (err) => {
  if (err) {
    console.log('Failed to load a plugin:', err);
  }
  server.start(() => {
    console.log(`API Server Running At: ${server.info.uri}`);
  });

  DialogFlow.findOne().then((doc) => {
    makeDialogs(doc);
  }).catch(console.error);
});

