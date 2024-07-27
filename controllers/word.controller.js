const Word = require('../models/word.model');

exports.addWord = async (req, res) => {
  try {
    const { englishWord, translations, difficulty, category } = req.body;

    // Validate input
    if (!englishWord || !translations || translations.length !== 4 || !difficulty || !category) {
      return res.status(400).json({ sucecess: false, message: 'All fields are required and translations must have exactly 4 items' });
    }

    // Check if the word already exists
    const existingWord = await Word.findOne({ englishWord });
    if (existingWord) {
      return res.status(409).json({ sucecess: false, message: 'Word already exists' });
    }

    // Create a new word
    const newWord = new Word({
      englishWord,
      translations,
      difficulty,
      category
    });

    // Save the word to the database
    await newWord.save();

    res.status(201).json({ sucess: true, message: 'Word added successfully', word: newWord });
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({ sucecess: false, message: 'Error adding word', error: error.message });
  }
};