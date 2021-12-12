const Schema = require('mongoose').Schema;

const schema = new Schema({
  key: { type: String, required: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  name: { type: String },
  description: { type: String },
  group: { type: String, default: 'system', required: true },
  public: { type: Boolean, default: false },
  type: {
    type: String,
    default: 'text'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  priority: { type: Number, required: true, default: 1},
  isActived: { type: Boolean, default: true }
}, {
  restrict: true,
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = schema;
