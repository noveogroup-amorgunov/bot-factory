const request = require('request');

const getParams = o => Object.keys(o).map(key => `${key}=${encodeURIComponent(o[key])}`).join('&');

const requestPromise = (url, params = false) => {
  const paramsString = params ? getParams(params) : '';
  const urlWithParams = `${url}?${paramsString}`;

  console.log(urlWithParams);
  return new Promise((resolve, reject) => {
    request.get(urlWithParams, (error, response, body) => {
      const statusCode = response && response.statusCode;
      console.log(body);
      console.log(error);
      // handle error
      if (error || statusCode < 200 || statusCode > 299) {
        reject(new Error(`Failed to load page with status code: ${response && response.statusCode}`));
      }
      resolve(body);
    });
  });
};

module.exports = (acc, item) => {
  acc.push((session, next) => {
    requestPromise(item.text, session.parameters || false).then((body) => {
      const data = JSON.parse(body).data;
      session.send(typeof data === 'string' ? data : data.join(', '));
      !item.isLast && next();
    }).catch((error) => {
      console.log(error);
      session.send('Упс, произошла непредвиденная ошибка..')
    }
    );
  });
  return acc;
};
