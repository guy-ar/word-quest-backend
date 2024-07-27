const bcrypt = require('bcryptjs');
const UserSchema = require('../models/user.model');
const { validationResult } = require('express-validator');

// Assume we have a function to send emails
const sendEmail = require('../utils/sendEmail');

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let existingUser = await UserSchema.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ msg: 'Email already in use' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ msg: 'Username already taken' });
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const today = new Date();

        // Create a new user
        const newUser = new UserSchema({
            username,
            email,
            password: hashedPassword,
            created_at: today,
            last_login: null
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Return success response
        res.status(201).json({
            msg: 'User registered successfully',
            user: {
                id: savedUser.id,
                username: savedUser.username,
                email: savedUser.email,
                created_at: savedUser.created_at
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        
        // Check for specific MongoDB errors
        if (error.name === 'MongoError') {
            if (error.code === 11000) { // Duplicate key error
                return res.status(400).json({ msg: 'User with that email or username already exists' });
            }
        }
        
        // For any other errors
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    try {
        const user = await UserSchema.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
  
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }
  
        // Check if new password meets complexity requirements
        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
  
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

        await user.save();

        // Create reset url
        const resetUrl = process.env.FRONTEND_URL + `/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ msg: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await UserSchema.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, data: 'Password reset success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
