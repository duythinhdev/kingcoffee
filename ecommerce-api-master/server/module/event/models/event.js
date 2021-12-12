const Schema = require('mongoose').Schema;

const schema = new Schema({
  sponsorId: {
    type: Schema.Types.ObjectId
  },
  sponsorName: String,
  parentId: {
    type: Schema.Types.ObjectId
  },
  parentName: String,
  ownerId: {
    type: Schema.Types.ObjectId
  },
  ownerName: String,
  productId: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'Product'
  },
  level: { type: Number, default: 1 },
  numberChild: { type: Number, default: 0 },
  code: {
    type: String,
    unique: true,
    default: '10000'
  },
  isReward: { type: Boolean, default: false },
  status: { type: Boolean, default: false },
  isForRoot: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  restrict: true,
  minimize: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

schema.virtual('parent', {
  ref: 'User',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});


schema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

schema.virtual('sponsor', {
  ref: 'User',
  localField: 'sponsorId',
  foreignField: '_id',
  justOne: true
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = schema;
