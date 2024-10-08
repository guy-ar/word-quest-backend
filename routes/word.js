const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// @route   GET api/words
// @desc    Get all words
// @access  Public
// Route to get words (with optional category and difficulty filter)
router.get(
    '/',
     wordController.getWords
    );

// @route   POST api/words/add
// @desc    Add new word
// @access  Private
router.post(
    '/add',
    [
        [
        //check('word', 'Word is required').not().isEmpty(),
        //check('definition', 'Definition is required').not().isEmpty()
        check('englishWord', 'English word is required').not().isEmpty(),
        check('translations', 'Translations are required').isArray({ min: 4, max: 4 }),
        check('difficulty', 'Difficulty is required').isInt({ min: 1, max: 99 }),
        check('category', 'Category is required').not().isEmpty()
        ],
        auth
    ],
     wordController.addWord);

// @route   POST api/words/upload
// @desc    Upload words from JSON file
// @access  Private
router.post(
    '/upload', 
    auth, 
    wordController.uploadWords);

// @route   GET api/words/random
// @desc    Get random words with optional filters
// @access  Public
router.get(
    '/random', 
    auth, 
    wordController.getRandomWords);

// @route   GET api/words/categories
// @desc    Get all unique categories
// @access  Public
router.get(
    '/categories', 
    wordController.getCategories);


// @route   GET api/words/:id
// @desc    Get a single word by ID
// @access  Public
router.get('/:id', wordController.getWord);

// @route   PUT api/words/:id
// @desc    Update a word
// @access  Private
router.put(
  '/:id',
  [
    [
      check('englishWord', 'English word is required').not().isEmpty(),
      check('translations', 'Translations are required').isArray({ min: 4, max: 4 }),
      check('difficulty', 'Difficulty is required').isInt({ min: 1, max: 99 }),
      check('category', 'Category is required').not().isEmpty()
    ],
    auth
  ],
  wordController.updateWord
);

module.exports = router;