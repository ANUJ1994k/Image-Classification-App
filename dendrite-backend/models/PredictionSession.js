const mongoose = require('mongoose');

const PredictionSessionSchema = new mongoose.Schema({
  imageUrl: String,
  label: String,
  confidence: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('PredictionSession', PredictionSessionSchema);
