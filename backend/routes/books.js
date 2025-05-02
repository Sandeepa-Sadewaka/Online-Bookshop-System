// server/routes/books.js
const express = require('express');
const { fetchBooksFromAPI } = require('../server/services/bookService');
const router = express.Router();

// Get books from external API
router.get('/external', async (req, res) => {
  try {
    const { q, filter, sort } = req.query;
    const books = await fetchBooksFromAPI(q, { filter, sort });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;