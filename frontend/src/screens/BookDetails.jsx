import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import '../styles/BookDetails.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [apiLoading, setApiLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        const bookData = response.data.volumeInfo;

        setBook({
          id,
          title: bookData.title || 'Untitled',
          authors: bookData.authors || ['Unknown Author'],
          description: bookData.description || 'No description available',
          price: (Math.random() * 30 + 10).toFixed(2),
          image: bookData.imageLinks?.thumbnail || '/default-book.jpg',
          stock: Math.floor(Math.random() * 50) + 1,
        });
      } catch (err) {
        setError('Failed to load book details. Please try again later.');
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book) return;

    setApiLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/addtocart`,
        {
          product_id: book.id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
      } else {
        throw new Error(response.data.message || 'Failed to add to cart');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add to cart');
      console.error('Add to cart error:', err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book) return;

    try {
      setPaymentProcessing(true);
      const stripe = await stripePromise;
      const token = localStorage.getItem('authToken');

      const response = await axios.post(
        'http://localhost:5000/api/payment/create-checkout-session',
        {
          cartItems: [
            {
              title: book.title,
              image: book.image,
              authors: book.authors,
              price: parseFloat(book.price),
              quantity: quantity,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <div className="book-image-container">
          <img
            src={book.image}
            alt={book.title}
            className="book-image"
            onError={(e) => {
              e.target.src = '/default-book.jpg';
            }}
          />
        </div>
        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-authors">By {book.authors.join(', ')}</p>
          <p className="book-description">{book.description}</p>
          <div className="price-section">
            <span className="price">${book.price}</span>
            <span
              className={`stock-status ${
                book.stock > 0 ? 'in-stock' : 'out-of-stock'
              }`}
            >
              {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}
            </span>
          </div>
          <div className="quantity-section">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={book.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(book.stock, Math.max(1, parseInt(e.target.value) || 1)))
              }
              className="quantity-input"
            />
          </div>
          <div className="action-buttons">
            <button
              className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={book.stock <= 0 || isAdded || apiLoading}
            >
              {apiLoading
                ? 'Adding...'
                : book.stock > 0
                ? isAdded
                  ? '✓ Added to Cart'
                  : 'Add to Cart'
                : 'Out of Stock'}
            </button>
            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={book.stock <= 0 || paymentProcessing}
            >
              {paymentProcessing ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
