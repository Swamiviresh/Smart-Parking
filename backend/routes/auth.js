const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require('../db/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, is_disabled } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const existing = await client.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email.trim().toLowerCase()]
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.execute({
      sql: `INSERT INTO users (name, email, password, role, is_disabled) VALUES (?, ?, ?, ?, ?)`,
      args: [name.trim(), email.trim().toLowerCase(), hashedPassword, 'user', is_disabled ? 1 : 0]
    });

    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await client.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email.trim().toLowerCase()]
    });
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: Number(user.id), email: user.email, role: user.role, is_disabled: user.is_disabled },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token, role: user.role, name: user.name, is_disabled: user.is_disabled });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters.' });
    }

    const result = await client.execute({
      sql: `SELECT * FROM users WHERE id = ?`,
      args: [req.user.id]
    });
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await client.execute({
      sql: `UPDATE users SET password = ? WHERE id = ?`,
      args: [hashedNew, req.user.id]
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
