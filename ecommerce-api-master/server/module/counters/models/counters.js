const Schema = require('mongoose').Schema;

const schema = new Schema({
  type: {
    type: String,
    unique: true
  },
  sequence_value: {
    type: Number,
    default: 1
  }
});

module.exports = schema;
