const DialogFlow = require('../../common/models/dialog-flow');
const makeDialogs = require('./make-dialogs');
const path = require('path');

exports.register = (server, options, next) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: path.join(__dirname, '../client'),
    path: 'templates',
  });

  const routes = [];

  routes.push({
    method: 'GET',
    path: '/dialogs',
    handler: (request, reply) => {
      DialogFlow.findOne({}).then((doc) => {
        reply(doc).code(200);
      }).catch(console.error);
    },
  });

  routes.push({
    method: 'POST',
    path: '/dialogs',
    handler: (request, reply) => {
      // create new dialog-flow
      // const dialogFlow = new DialogFlow(request.payload);
      // dialogFlow.save().then((doc) => {
      //   console.log(doc);
      //   reply(doc).code(200);
      // });
      const payload = request.payload;
      DialogFlow.findOneAndUpdate({}, payload, { new: true }).then((doc) => {
        console.log(doc);
        makeDialogs(doc);
        reply(doc).code(200);
      }).catch(console.error);

      // $.ajax({
      //   type
      //   data:
      // })
    },
  });

  routes.push({
    method: ['GET'],
    path: '/constructor',
    handler: (request, reply) => {
      reply.view('index'); // , { param: request.params.param });
    }
  });


  routes.push({
    method: 'GET',
    path: '/js/{param*}',
    handler: {
      file: request => `${path.join(__dirname, '../client')}/js/${request.params.param}`
    }
  });

  routes.push({
    method: 'GET',
    path: '/css/{param*}',
    handler: {
      file: request => `${path.join(__dirname, '../client')}/css/${request.params.param}`
    }
  });

  server.route(routes);
  next();
};

exports.register.attributes = {
  name: 'routes-plugin',
  version: '1.0.0'
};
