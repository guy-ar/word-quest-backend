const express = require('express');
const router = express.Router();
const gameResultController = require('../controllers/gameResult.controller');
const { check } = require('express-validator');
const auth = require('../middleware/auth');


// @route   GET api/gameResults/bestResults
// @desc    Get 10 best results
// @access  Public
// Route to get best results order by score
router.get(
    '/topResults',
    auth, 
    gameResultController.getTopResults
    );

// @route   GET api/gameResults/user
// @desc    Get results for user with email
// @access  private
// Route to get user game results - TBD - pagination?? 

// @route   POST api/gameResults/add
// @desc    Add new gmaeResult
// @access  Private
router.post(
    '/add',
    [
        [
            check('userEmail', 'userEmail  is required').not().isEmpty(),
            check('score', 'Score is required').not().isEmpty(),
            check('totalWords', 'Total words is required').not().isEmpty(),
            check('correctWords', 'correctWords is required').not().isEmpty(),
            check('wordResults', 'wordResults is required').not().isEmpty()
        ],
        auth
    ],
    gameResultController.createGameResult
);

module.exports = router;
