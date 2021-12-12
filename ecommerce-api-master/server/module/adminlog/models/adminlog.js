const Schema = require('mongoose').Schema;

const schema = new Schema({
  text: {
    type: String
  },
  username: {
    type: String
  },
  action:{
    type: String,
    enum: ['Xóa', 'Chỉnh sửa', 'Tạo']
  },
  before: {
    type: String,
    default: ''
  },
  after: {
    type: String,
    default: ''
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
  },
  toJSON: {
    virtuals: true
  }
});

module.exports = schema;
