import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../styles/CartScreen.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/cart/getcart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItemsRaw = response.data.cartItems;

        const detailedItems = await Promise.all(
          cartItemsRaw.map(async (item) => {
            try {
              const productRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${item.product_id}`);
              const product = productRes.data.volumeInfo;

              return {
                product_id: item.product_id,
                quantity: Number(item.quantity),
                title: product.title || 'Unknown Title',
                authors: product.authors || ['Unknown Author'],
                price: parseFloat((Math.random() * 30 + 10).toFixed(2)),
                image: product.imageLinks?.thumbnail || '/default-book.jpg',
                stock: Number(item.stock) || 10,
              };
            } catch (err) {
              return {
                product_id: item.product_id,
                quantity: Number(item.quantity),
                title: 'Unknown Product',
                authors: ['Unknown Author'],
                price: 0,
                image: '/default-book.jpg',
                stock: 0,
              };
            }
          })
        );

        setCartItems(detailedItems);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    try {
      setUpdatingItem(productId);
      const token = localStorage.getItem('authToken');

      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems(cartItems.map(item => 
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingItem(productId);
      const token = localStorage.getItem('authToken');

      const response = await axios.delete(
        `http://localhost:5000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="cart-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/books')}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>by {Array.isArray(item.authors) ? item.authors.join(', ') : 'Unknown Author'}</p>
                  <p className="price">${(item.price || 0).toFixed(2)}</p>
                </div>
                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updatingItem === item.product_id}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock || updatingItem === item.product_id}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
                <button
                  className="remove-item"
                  onClick={() => removeItem(item.product_id)}
                  disabled={updatingItem === item.product_id}
                >
                  {updatingItem === item.product_id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            {error && <div className="error-message">{error}</div>}

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;