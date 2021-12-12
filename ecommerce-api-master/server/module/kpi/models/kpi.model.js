
const Schema = require('mongoose').Schema;

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId
  },
  totalPriceMonth: {
    type: Number
  },
  valuePercent: {
    type: Number
  },
  kpiMonth: {
    type: Number
  },
  kpiReward: {
    type: Number
  },
  month: {
    type: Date
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

module.exports = schema;
