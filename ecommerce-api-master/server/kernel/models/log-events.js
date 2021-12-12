const mongoose = require('mongoose');

exports.model = {
  LogEvent() {
    const LogSchema = new mongoose.Schema({
      path: {
        type: String
      },
      reqQuery: {
        type: mongoose.Schema.Types.Mixed
      },
      reqBody: {
        type: mongoose.Schema.Types.Mixed
      },
      headers: {
        type: mongoose.Schema.Types.Mixed
      },
      eventId: {
        type: mongoose.Schema.Types.ObjectId
      },
      username: {
        type: String
      },
      status: { type: Number, default: 1 },
      isProcess: { type: Boolean, default: false },
      level: {
        type: String,
        default: 'error'
      },
      error: {
        type: mongoose.Schema.Types.Mixed
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, {
      collection: 'logevents',
      minimize: false,
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });

    return LogSchema;
  }
};
