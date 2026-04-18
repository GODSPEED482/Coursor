const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, sub: googleId } = payload;

        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                email,
                authProvider: 'google',
                googleId
            });
            await user.save();
        } else if (!user.googleId) {
            // Unify existing local account with google account
            user.googleId = googleId;
            await user.save();
        }

        const jwtPayload = { user: { id: user.id } };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error("Google Auth error:", err);
        res.status(401).json({ message: 'Google Authentication Failed' });
    }
};

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check if user has a password (they might have registered via Google)
        if (!user.password) {
            return res.status(400).json({ 
                message: 'This account was created with Google. Please use Google Sign-In.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: 'Server Error during login' });
    }
};
