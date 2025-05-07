import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import './../../styles/CartScreen.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/cart/getcart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawItems = res.data.cartItems || [];

        const detailedItems = await Promise.all(
          rawItems.map(async (item) => {
            try {
              const book = await axios.get(
                `https://www.googleapis.com/books/v1/volumes/${item.product_id}`
              );
              const info = book.data.volumeInfo;

              return {
                product_id: item.product_id,
                quantity: item.quantity,
                name: info.title || 'Untitled',
                authors: info.authors || ['Unknown'],
                price: parseFloat((Math.random() * 30 + 10).toFixed(2)),
                image: info.imageLinks?.thumbnail || '/default-book.jpg',
              };
            } catch {
              return {
                product_id: item.product_id,
                quantity: item.quantity,
                name: 'Unknown Book',
                authors: ['Unknown'],
                price: 0,
                image: '/default-book.jpg',
              };
            }
          })
        );

        setCartItems(detailedItems);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const updateQuantity = async (id, qty) => {
    if (qty < 1) return;

    try {
      const token = localStorage.getItem('authToken');
      setUpdatingItem(id);

      await axios.put(
        `http://localhost:5000/api/cart/update/${id}`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems((prev) =>
        prev.map((item) => (item.product_id === id ? { ...item, quantity: qty } : item))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      setUpdatingItem(id);

      await axios.delete(`http://localhost:5000/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems((prev) => prev.filter((item) => item.product_id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      setCheckoutLoading(true);
      setError('');

      const itemsPayload = cartItems.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await axios.post(
        'http://localhost:5000/api/create-checkout-session',
        {
          items: itemsPayload,
          success_url: `${window.location.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cart`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.id || response.data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || err.message || 'Checkout error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Shopping Cart</h1>
      {error && <div className="cart-error">{error}</div>}
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button 
            onClick={() => navigate('/books')} 
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <div className="item-image-container">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.src = '/default-book.jpg';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.name}</h3>
                  <p className="item-authors">By: {item.authors.join(', ')}</p>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    disabled={updatingItem === item.product_id || item.quantity <= 1}
                    className="quantity-btn"
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    disabled={updatingItem === item.product_id}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
                
                <button
                  onClick={() => removeItem(item.product_id)}
                  disabled={updatingItem === item.product_id}
                  className="remove-btn"
                >
                  {updatingItem === item.product_id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || cartItems.length === 0}
              className="checkout-btn"
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;