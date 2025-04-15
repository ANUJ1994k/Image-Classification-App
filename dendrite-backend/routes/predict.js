// server.js or routes/predict.js
const express = require('express');
const multer = require('multer');
const PredictionSession = require('../models/PredictionSession');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    const { path } = req.file;

    // Dummy prediction - replace with real ML prediction
    const prediction = {
      label: 'Cat',
      confidence: 0.98
    };

    // Save to MongoDB
    const savedSession = await PredictionSession.create({
      imageUrl: path,
      label: prediction.label,
      confidence: prediction.confidence,
    });

    res.json(prediction);
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = router;
