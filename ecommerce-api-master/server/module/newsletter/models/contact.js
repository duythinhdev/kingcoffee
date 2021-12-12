const Schema = require('mongoose').Schema;

const schema = new Schema({
  username:{
    type: String,
    index: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    typ: String
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = schema;
