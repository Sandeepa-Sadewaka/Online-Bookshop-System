// src/components/Books/BookList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from './BookCard';
import SearchFilters from './SearchFilters';
import './../../styles/BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('web development');
  const [filters, setFilters] = useState({
    category: '',
    sort: 'relevance'
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/books/external', {
        params: { q: query, ...filters }
      });
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [query, filters]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  if (loading) return <div>Loading books...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="book-list">
      <SearchFilters 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />
      
      <div className="books-grid">
        {books.map(book => (
          <BookCard 
            key={book.id} 
            book={book} 
            onAddToCart={() => addToCart(book)} 
          />
        ))}
      </div>
    </div>
  );
};

export default BookList;