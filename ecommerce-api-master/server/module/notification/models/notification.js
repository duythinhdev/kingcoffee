const { boolean, object } = require('@hapi/joi');

const Schema = require('mongoose').Schema;

const schema = new Schema({
  type: {
    type: String,
    enum: [
      // tất cả thông báo
      'all',
      // thông báo dành cho promotion
      'promotionNotification'
    ],
    default: ''
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    default: ''
  },
  //lưu id của promotion khi thông báo promotion
  data: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  usersRead: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
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

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

module.exports = schema;
