const Schema = require('mongoose').Schema;

const schema = new Schema({
  code: {
    type: String,
    uppercase: true,
    trim: true,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 30
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // ordering:{
  //   type: Number,
  //   min: 1
  // },
  // isPriority:{
  //   type: Boolean,
  //   default: false
  // },
  status:{
    type: String,
    enum: ['new', 'running', 'finish', 'stop'],
    default: 'new'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isDisplayHomePage:{
    type: Boolean,
    default: false
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

module.exports = schema;
