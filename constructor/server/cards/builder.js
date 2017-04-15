const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = (acc, data) => {
  const type = _.get(data, 'type') || 'text';
  const builderPath = `./${type}.js`;
  if (!fs.existsSync(path.resolve(__dirname, builderPath))) {
    console.warn(`Module '${builderPath}' not exists!`);
    return require('./text')(acc, data);
  }
  const builder = require(builderPath);
  return builder(acc, data);
};
