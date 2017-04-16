const EventEmitter = require('events');
const Message = require('../core/message');
const request = require('request');

const api = (method, options) => {
  if (!options.v) {
    options.v = 5.63;
  }

  return new Promise((resolve, reject) => {
    request({
      url: `https://api.vk.com/method/${method}`,
      method: 'POST',
      form: options,
      json: true
    }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
};

var execute = [];
var group = {};

setInterval(() => {
  if (execute.length) {
    const method = [];

    execute.forEach(msg => {
      method.push(`API.messages.send(${JSON.stringify(msg)})`);
    });

    api('execute', {
      code: `return [ ${method.join(',')} ];`,
      access_token: group.token
    }).then(console.log).catch(console.log);

    execute = [];
  }
}, 350);

const app = {
  auth: function(token, opts) {
    group.token = token;

    if (opts) {
      group.mode = opts;
    }
  },
  isMember: function(gid, uid) {
    return new Promise((resolve, reject) => {
      api('groups.isMember', {
        group_id: gid,
        user_id: uid,
        v: 5.62
      }).then(body => {
        if (body.response) {
          resolve('User is subscriber');
        } else {
          reject('User isn\'t subscriber');
        }
      });
    });
  },
  getUser(uid) {
    return new Promise((resolve, reject) => {
      api('users.get', {
        user_id: uid,
        v: 5.62
      }).then((body) => {
        console.log(body);
        if (body.response && body.response.length) {
          resolve(body.response[0]);
        } else {
          reject('User isn\'t subscriber');
        }
      });
    });
  },
  sendMessage(uid, msg, attach) {
    const options = (typeof uid === 'object') ? uid : { user_id: uid, message: msg, attachment: attach };
    execute.push(options);
  }
};

module.exports = class VKConnector extends EventEmitter {
  constructor({ token, availableOnlyForSubscribers, groupId }) {
    super();
    this.app = app;
    this.app.auth(token, {
      subscribers: !!availableOnlyForSubscribers,
      gid: groupId, // 144858186,
      msg: 'Bot available only for subscribers. Subscribe and then try again. <3'
    });
  }

  getUser(data) {
    return app.getUser(data.user.id);
  }

  send(message, user) {
    console.log('VKConnector::send');
    console.log(message);
    console.log(user.id);
    if (!message) {
      return;
    }
    return app.sendMessage(user.id, message);
  }

  listen() {
    return (request, response) => {
      console.log('VKConnector::listen');
      console.log(request.body);
      if (request.body.type && request.body.type === 'message_new' && request.body.object.date > 1492167705) {
        const userId = request.body.object.user_id;

        const msg = new Message()
          .address({
            channelId: 'vk',
            user: { id: userId }
          })
          .timestamp()
          .text(request.body.object.body);

        console.log(msg);

        this.emit('receive-message', msg);
        response.end('ok');
        return;
      }
      response.end('ok');
    };
  }
};
