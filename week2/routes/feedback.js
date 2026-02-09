const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../db/connection');

const router = express.Router();

/**
 * Sanitize string to prevent XSS when displaying in HTML.
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

const submitValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 255 }).withMessage('Email must be at most 255 characters')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message must be at most 5000 characters')
    .escape(),
];

router.post('/', submitValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Feedback submitted successfully.',
    });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save feedback.' });
  }
});

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));
    const offset = (page - 1) * limit;
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    try {
      const [rows] = await pool.query(
        'SELECT id, name, email, message, created_at FROM feedback ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limitNum, offsetNum]
      );
      const [[{ count }]] = await pool.execute('SELECT COUNT(*) AS count FROM feedback');

      const sanitized = rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        created_at: row.created_at,
      }));

      res.json({
        success: true,
        data: sanitized,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error('DB error (GET):', err.message);
      res.status(500).json({ success: false, message: 'Failed to load feedback.' });
    }
  }
);

module.exports = router;
