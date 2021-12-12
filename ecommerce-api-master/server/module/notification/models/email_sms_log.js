const Schema = require('mongoose').Schema;

const schema = new Schema({
  sendTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  receiverName: {
    type: String
  },
  type:{
    type: String
  },
  sendMessage: {
    type: String,
    default: ""
  },
  request: {
    type: Object
  },
  response:{
    type: Object
  },
  createdAt: {
    type: Date
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
  }
});

module.exports = schema;
