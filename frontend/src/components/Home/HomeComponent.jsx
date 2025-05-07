import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import BookCard from '../Books/BookCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import '../../styles/Home.css';

function HomeComponent() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const category = searchParams.get('category');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${category || 'web development'}&maxResults=12&key=${apiKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch books');

      const data = await response.json();
      const formattedBooks =
        data.items?.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title || 'Untitled',
          authors: item.volumeInfo.authors || ['Unknown Author'],
          description: item.volumeInfo.description || 'No description available',
          price: (Math.random() * 30 + 10).toFixed(2),
          image: item.volumeInfo.imageLinks?.thumbnail || '/default-book-cover.jpg',
          stock: Math.floor(Math.random() * 50) + 5,
          category: item.volumeInfo.categories?.[0] || 'General',
        })) || [];

      setBooks(formattedBooks);
      setFilteredBooks(formattedBooks);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (category) {
      const filtered = books.filter((book) =>
        book.category.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [category, books]);
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-page">
      <main className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Welcome to Our Online Bookshop</h1>
            <p>Discover your next favorite book from our vast collection</p>
            <Link to="/books" className="btn btn-primary">
              Browse All Books
            </Link>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="featured-books">
          <h2>{category ? `${category} Books` : 'Featured Books'}</h2>
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onAddToCart={addToCart} />
            ))}
          </div>
          {filteredBooks.length === 0 && (
            <p className="no-books-message">
              No books found. Try a different search or category.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomeComponent;