import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../Context/CartContext';
import BookCard from '../components/Books/BookCard';
import SearchFilters from '../components/Common/SearchFilters';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import '../styles/BookScreen.css';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

function BooksScreen() {
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [filteredBooks, setFilteredBooks] = useState([]); // Store filtered books
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('web development');
  const [searchInput, setSearchInput] = useState(''); // For immediate client-side search
  const [filters, setFilters] = useState({
    category: '',
    sort: 'relevance',
    maxResults: 20
  });
  const { addToCart } = useCart();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
      const params = new URLSearchParams({
        q: query,
        maxResults: filters.maxResults,
        orderBy: filters.sort,
        printType: 'books'
      });

      if (filters.category) params.append('subject', filters.category);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${params.toString()}&key=${apiKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch books');

      const data = await response.json();
      
      const formattedBooks = data.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title || 'Untitled',
        authors: item.volumeInfo.authors || ['Unknown Author'],
        description: item.volumeInfo.description || 'No description available',
        price: (Math.random() * 30 + 10).toFixed(2),
        image: item.volumeInfo.imageLinks?.thumbnail || '/default-book-cover.jpg',
        stock: Math.floor(Math.random() * 50) + 5,
        category: item.volumeInfo.categories?.[0] || 'General',
        publishedDate: item.volumeInfo.publishedDate,
        pageCount: item.volumeInfo.pageCount
      })) || [];

      setAllBooks(formattedBooks);
      setFilteredBooks(formattedBooks); // Initially show all books
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters.category, filters.maxResults, filters.sort]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Client-side filtering
  useEffect(() => {
    let results = allBooks;
    
    // Filter by search input
    if (searchInput) {
      results = results.filter(book =>
        book.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        book.authors.join(' ').toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    
    // Filter by category
    if (filters.category) {
      results = results.filter(book =>
        book.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    // Sort results
    if (filters.sort === 'newest') {
      results = [...results].sort((a, b) => 
        new Date(b.publishedDate) - new Date(a.publishedDate)
      );
    } else if (filters.sort === 'price-low') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      results = [...results].sort((a, b) => b.price - a.price);
    }

    setFilteredBooks(results);
  }, [allBooks, searchInput, filters.category, filters.sort]);

  const handleSearch = (searchQuery) => {
    setSearchInput(searchQuery); // For client-side filtering
    setQuery(searchQuery); // For API search when needed
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <><>
      <Header />
      <div className="books-screen">
        <div className="books-header">
          <section className="search-filters-section">
            <h1 className="search-filters-header">Browse Our Collection</h1>
            <SearchFilters
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              availableCategories={[
                'Fiction', 'Science', 'Technology',
                'Biography', 'History', 'Business'
              ]} />
          </section>
        </div>

        <div className="books-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={addToCart} />
            ))
          ) : (
            <div className="no-results">
              <p>No books found. Try a different search.</p>
            </div>
          )}
        </div>

        {allBooks.length > 0 && filteredBooks.length > 0 && (
          <div className="load-more">
            <button
              onClick={() => setFilters(prev => ({
                ...prev,
                maxResults: prev.maxResults + 20
              }))}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Books'}
            </button>
          </div>
        )}
      </div>
    </><Footer /></>
  );
}

export default BooksScreen;