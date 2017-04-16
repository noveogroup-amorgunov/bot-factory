const request = require('request');

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

module.exports = (acc, item) => {
  acc.push((session, next) => {
    requestPromise(item.text).then((body) => {
      session.send(JSON.parse(body).data);
      !itsem.isLast && next();
    }).catch((error) => 
      session.send('Упс, произошла непредвиденная ошибка..')
    );
  });
  return acc;
};
