const Word = require('../models/word.model');
const upload = require('../middleware/multerConfig');
const fs = require('fs');


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

  exports.getRandomWords = async (req, res) => {
    try {
      const { category, difficulty, quantity } = req.query;
      let query = {};
  
      // If category is provided, add it to the query
      if (category) {
        query.category = category;
      }
  
      // If difficulty is provided, add it to the query
      if (difficulty) {
        query.difficulty = parseInt(difficulty);
      }

      // Convert quantity to a number, default to 10 if not provided or invalid
      const limit = parseInt(quantity) || 20;
  
      // Fetch words based on the query, limit, and randomize
      const words = await Word.aggregate([
        { $match: query },
        { $sample: { size: limit } },
        { $project: { __v: 0 } }
      ]);
  
      res.status(200).json({
        success: true,
        message: 'Random words fetched successfully',
        count: words.length,
        words: words
      });
    } catch (error) {
      console.error('Error fetching random words:', error);
      res.status(500).json({ success: false, message: 'Error fetching random words', error: error.message });
    }
  };
  

  exports.uploadWords = [
    upload.single('wordsFile'),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
  
      try {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const wordsData = JSON.parse(fileContent);
        console.log("file content:", wordsData)

  
        if (!Array.isArray(wordsData.words)) {
          return res.status(400).json({ success: false, message: 'Invalid JSON format' });
        }

        const results = {
          added: 0,
          skipped: 0,
          errors: []
        };
        console.log("before for loop")
        for (const wordData of wordsData.words) {
          try {
            const { englishWord, translations, difficulty, category } = wordData;
  
            // Validate input
            if (!englishWord || !translations || translations.length !== 4 || !difficulty || !category) {
              results.errors.push(`Invalid data for word: ${englishWord}`);
              console.error(`Invalid data for word: ${englishWord}`);
              continue;
            }

             // Check if the word already exists
          const existingWord = await Word.findOne({ englishWord });
          if (existingWord) {
            console.error(`Word already exists: ${englishWord}`);
            results.skipped++;
            continue;
          }

          // Create and save the new word
          const newWord = new Word(wordData);
          await newWord.save();
          results.added++;
        } catch (error) {
          results.errors.push(`Error adding word: ${wordData.englishWord}, ${error.message}`);
        }
      }

      // Delete the temporary file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: 'File processed',
        results: results
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ success: false, message: 'Error processing file', error: error.message });
    }
  }
];

// In word.controller.js, add this new function:
exports.getCategories = async (req, res) => {
  try {
    // Use distinct to get unique categories
    const categories = await Word.distinct('category');
    
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      count: categories.length,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

// In word.controller.js, add these new functions:

// Get a single word by ID
exports.getWord = async (req, res) => {
  try {
    const wordId = req.params.id;
    
    const word = await Word.findById(wordId).select('-__v');
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Word fetched successfully',
      word: word
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching word', 
      error: error.message 
    });
  }
};

// Update a word
exports.updateWord = async (req, res) => {
  try {
    const wordId = req.params.id;
    const { englishWord, translations, difficulty, category } = req.body;

    // Validate input
    if (!englishWord || !translations || translations.length !== 4 || !difficulty || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required and translations must have exactly 4 items' 
      });
    }

    // Check if the updated englishWord already exists for a different word
    const existingWord = await Word.findOne({ 
      englishWord, 
      _id: { $ne: wordId } 
    });
    
    if (existingWord) {
      return res.status(409).json({ 
        success: false, 
        message: 'This English word already exists for another entry' 
      });
    }

    const updatedWord = await Word.findByIdAndUpdate(
      wordId,
      {
        englishWord,
        translations,
        difficulty,
        category
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedWord) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Word updated successfully',
      word: updatedWord
    });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating word', 
      error: error.message 
    });
  }
};