import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import '../../styles/BookCard.css';

function BookCard({ book }) {
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Get addToCart function from CartContext

  const handleAddToCart = async (e) => {
  e?.preventDefault();
  e?.stopPropagation();

  const token = localStorage.getItem('authToken');
  const user_email = localStorage.getItem('userEmail');

  if (!token || !user_email) {
    navigate('/login');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/cart/addtocart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_email,
        product_id: book.id,
        quantity: 1
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setIsAdded(true);
      addToCart(book);
      setTimeout(() => setIsAdded(false), 1500);
    } else {
      alert(data.message || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    alert('Something went wrong while adding to cart');
  }
};


  const handleShowDetails = () => {
    navigate(`/book-details/${book.id}`);
  };

  return (
    <div className="book-card">
      <div className="book-image">
        <img 
          src={book.image || '/default-book-cover.jpg'} 
          alt={book.title} 
          onError={(e) => { e.target.src = '/default-book-cover.jpg'; }}
        />
      </div>

      <div className="book-details">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.authors?.join(', ') || 'Unknown Author'}</p>

        <div className="book-meta">
          <span className="book-price">${book.price}</span>
          <span className={`book-stock ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <button 
          className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={book.stock <= 0 || isAdded}
        >
          {book.stock > 0 ? (isAdded ? '✓ Added' : 'Add to Cart') : 'Out of Stock'}
        </button>

        <button 
          className="show-details-btn" 
          onClick={handleShowDetails}
        >
          Show Details
        </button>
      </div>
    </div>
  );
}

export default BookCard;