// server/services/bookService.js
const axios = require('axios');
require('dotenv').config();

const fetchBooksFromAPI = async (query, filters = {}) => {
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: 20,
        printType: 'books',
        ...filters
      },
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}` // If using API key
      }
    });

    return response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || ['Unknown'],
      description: item.volumeInfo.description || 'No description available',
      price: calculateRandomPrice(), // External APIs often don't provide prices
      image: item.volumeInfo.imageLinks?.thumbnail || '/default-book-cover.jpg',
      stock: Math.floor(Math.random() * 50) + 5, // Mock stock data
      publishedDate: item.volumeInfo.publishedDate,
      categories: item.volumeInfo.categories || ['General']
    }));
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch books from API');
  }
};

// Helper function since most APIs don't provide prices
const calculateRandomPrice = () => {
  return (Math.random() * 30 + 10).toFixed(2); // $10-$40
};

module.exports = { fetchBooksFromAPI };