const GameResult = require('../models/gameResult.model');
const User = require('../models/user.model');
const Word = require('../models/word.model');

  exports.createGameResult = async (req, res) => {
    try {
      const { userEmail, score, totalWords, correctWords, wordResults } = req.body;

      // Find the user by email
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ succecess: false, message: 'User not found' });
      }

      const wordResultsArray = []
      for (let i=0; i<wordResults.length; i++) {
        const wr = wordResults[i];
        const word = await Word.findOne({ englishWord: wr.englishWord });
        if (!word) {
            return res.status(404).json({ succecess: false, message: 'English word not found' });
        }
        wordResultsArray.push({ word: word._id, isCorrect: wr.isCorrect });
      }
        
      // Create a new game result
      const newGameResult = new GameResult({
        user: user._id,
        score,
        totalWords,
        correctWords,
        wordResults: wordResultsArray // Pass the array of wordResults
      });

      // Save the game result
      await newGameResult.save();

      res.status(201).json({ 
        succecess: true,
        message: 'Game result saved successfully',
        gameResult: newGameResult
      });
    } catch (error) {
      console.error('Error in createGameResult:', error);
      res.status(500).json({ succecess: false, message: 'Error saving game result', error: error.message });
    }
  }

  // You can add more controller methods here as needed