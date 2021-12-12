const Schema = require('mongoose').Schema;

const schema = new Schema({
  code: {
    type: String,
    index: true,
    uppercase: true,
    trim: true
  },
  eventProductId: {
    type: Schema.Types.ObjectId
  },
  expired: {
    type: Boolean,
    default: false
  },
  expiredTime: {
    type: Date
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
}, {
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

schema.virtual('eventProduct', {
  ref: 'EventProduct',
  localField: 'eventProductId',
  foreignField: '_id',
  justOne: true
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = schema;
