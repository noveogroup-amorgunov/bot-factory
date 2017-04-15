const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const dialogFlowSchema = new Schema({
  dialogs: [Schema.Types.Mixed],
  entry_point: String
});

const dialogFlow = mongoose.model('DialogFlow', dialogFlowSchema);
module.exports = dialogFlow;
