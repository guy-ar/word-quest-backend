const Word = require('../models/word.model');

exports.addWord = async (req, res) => {
  try {
    const { englishWord, translations, difficulty, category } = req.body;
    console.log(req.body)
    // Validate input
    if (!englishWord || !translations || translations.length !== 4 || !difficulty || !category) {
      return res.status(400).json({ succecess: false, message: 'All fields are required and translations must have exactly 4 items' });
    }

    // Check if the word already exists
    const existingWord = await Word.findOne({ englishWord });
    if (existingWord) {
      return res.status(409).json({ succecess: false, message: 'Word already exists' });
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

    res.status(201).json({ success: true, message: 'Word added successfully', word: newWord });
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({ success: false, message: 'Error adding word', error: error.message });
  }
};

exports.getWords = async (req, res) => {
    try {
      const { category, difficulty } = req.query;
      let query = {};
  
      // If category is provided, add it to the query
      if (category) {
        query.category = category;
      }
  
      // If difficulty is provided, add it to the query
      if (difficulty) {
        query.difficulty = parseInt(difficulty);
      }
  
      // Fetch words based on the query
      const words = await Word.find(query).select('-__v');
  
      res.status(200).json({
        success: true,
        message: 'Words fetched successfully',
        count: words.length,
        words: words
      });
    } catch (error) {
      console.error('Error fetching words:', error);
      res.status(500).json({ success: false, message: 'Error fetching words', error: error.message });
    }
  };