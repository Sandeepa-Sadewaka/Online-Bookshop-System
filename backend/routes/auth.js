const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const [rows] = await db.promise().query(
            'SELECT id, username, email, password, phone FROM users WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            isLoggedIn: true,
            user: {
                id: user.id,
                name: user.username,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});

// ---------------------- GET PROFILE ----------------------
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [rows] = await db.promise().query('SELECT id, username, email, phone FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: rows[0]
        });
    } catch (err) {
        console.error('Profile retrieval error:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
    }
});

// ---------------------- UPDATE PROFILE ----------------------
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,15}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        }
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number' });
        }

        await db.promise().query(
            'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: { id: userId, name, email, phone }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

module.exports = router;
