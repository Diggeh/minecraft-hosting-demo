const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    crafty_server_id: {
      type: String,
      required: true
    },
    serverName: {
      type: String,
      required: true,
      trim: true
    },
    port: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'starting', 'crashed'],
      default: 'stopped'
    },
  },
  { timestamps: true } // <-- Correct placement
);

module.exports = mongoose.model('Server', serverSchema);