const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const usersSchema = require('../models/user.model');

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message:'failure', errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log(email.password)

  try {
    
    console.log(`Attempting to find user with email: ${email}`);
    console.log(`Attempting to find user with password: ${password}`);
    
    const user = await usersSchema.findOne({ email }).exec();
    
    console.log('User object:', user);
    console.log('User object type:', typeof user);
    console.log('Is user null?', user === null);
    console.log('Is user undefined?', user === undefined);

    if (!user) {
      console.log('No user found');
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    console.log('User found, ID:', user._id);
    
    if (!(user instanceof mongoose.Document)) {
      console.log('User is not a Mongoose document. Attempting to convert...');
      user = new usersSchema(user);
    }

    console.log('Comparing passwords');
    const storedPassword = String(user.password);
    console.log(storedPassword);
    console.log("<" + password+">");
    

    // Try comparing with both the original and stringified versions
    const isMatchOriginal = await bcrypt.compare(password, user.password);
    const isMatchString = await bcrypt.compare(password, storedPassword);

    console.log('Password match (original):', isMatchOriginal);
    console.log('Password match (string):', isMatchString);

    if (!isMatchOriginal && !isMatchString) {
      console.log('Password does not match');
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({success: true, token: token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send({success: false, message:'Server Error'});
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await usersSchema.findById(req.user.id).select('-password');
    res.json({success: true, user: user});
  } catch (err) {
    console.error(err.message);
    res.status(500).send({success: false, message:'Server Error'});
  }
};