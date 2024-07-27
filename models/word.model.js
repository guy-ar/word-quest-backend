const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  hebrew: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const wordSchema = new mongoose.Schema({
  englishWord: {
    type: String,
    required: true,
    unique: true
  },
  translations: {
    type: [translationSchema],
    validate: [arrayLimit, '{PATH} must have exactly 4 translations']
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  category: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length === 4;
}

const Word = mongoose.model('words', wordSchema);


module.exports = Word;