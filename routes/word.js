const express = require('express');
const router = express.Router();
const wordController = require('../controllers/word.controller');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// @route   POST api/words
// @desc    Add new word
// @access  Private
router.post(
    '/add',
    [
        check('word', 'Word is required').not().isEmpty(),
        check('definition', 'Definition is required').not().isEmpty()
    ],
     wordController.addWord);

module.exports = router;