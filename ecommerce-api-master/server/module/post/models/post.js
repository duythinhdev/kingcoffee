const Schema = require('mongoose').Schema;

const schema = new Schema({
  title: {
    type: String
  },
  alias: {
    type: String,
    index: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'post',
    index: true
  },
  categoryIds: [{
    type: Schema.Types.ObjectId,
    ref: 'PostCategory'
  }],
  ordering: {
    type: Number,
    default: 0
  },
  meta: {
    type: Schema.Types.Mixed
  },
  isMain: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Media'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
