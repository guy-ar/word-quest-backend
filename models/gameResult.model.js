const mongoose = require('mongoose');

const wordResultSchema = new mongoose.Schema({
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'words',
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const gameResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalWords: {
    type: Number,
    required: true
  },
  correctWords: {
    type: Number,
    required: true
  },
  wordResults: [wordResultSchema],
  gameDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const GameResult = mongoose.model('gameResults', gameResultSchema);

module.exports = GameResult;