const path = require('path');

exports.register = (server, options, next) => {
  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: path.join(__dirname, '../client'),
    path: 'templates',
  });

  next();
};

exports.register.attributes = {
  name: 'client-plugin',
  version: '1.0.0'
};
