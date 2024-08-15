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

// @route   POST api/words
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
        check('difficulty', 'Difficulty is required').isInt({ min: 1, max: 3 }),
        check('category', 'Category is required').not().isEmpty()
        ],
        auth
    ],
     wordController.addWord);

// @route   POST api/words/upload
// @desc    Upload words from JSON file
// @access  Private
router.post('/upload', 
    auth, 
    wordController.uploadWords);

module.exports = router;