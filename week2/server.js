const path = require('path');
const express = require('express');
const feedbackRoutes = require('./routes/feedback');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedback.html'));
});

async function start() {
  try {
    await pool.getConnection();
    console.log('MySQL connected OK');
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    console.error('Check: .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME), MySQL running, and db/schema.sql executed.');
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
