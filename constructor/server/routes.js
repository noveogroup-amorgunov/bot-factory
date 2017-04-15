// var store = {
//   dialogs: [{
//     title: 'Block 1 for Hello user',
//     cards: [{
//       text: "Hello user",
//       type: 'text'
//     }, {
//       text: "How are you?"
//     }]
//   }, {
//     title: 'help',
//     cards: ['....']
//   }]
// };

const DialogFlow = require('../../common/models/dialog-flow');

exports.register = (server, options, next) => {
  const routes = [];

  routes.push({
    method: 'GET',
    path: '/dialogs',
    handler: (request, reply) => {
      DialogFlow.findOne({}).then((doc) => {
        console.log(doc);
        reply(doc).code(200);
      }).catch(console.error);
    },
  });

  routes.push({
    method: 'POST',
    path: '/dialogs',
    handler: (request, reply) => {
      // const dialogFlow = new DialogFlow(request.payload);
      // dialogFlow.save().then((doc) => {
      //   console.log(doc);
      //   reply(doc).code(200);
      // });
      const payload = request.payload;
      DialogFlow.findOneAndUpdate({}, payload, { new: true }).then((doc) => {
        console.log(doc);
        reply(doc).code(200);
      }).catch(console.error);
    },
  });

  server.route(routes);
  next();
};

exports.register.attributes = {
  name: 'routes-plugin',
  version: '1.0.0'
};
