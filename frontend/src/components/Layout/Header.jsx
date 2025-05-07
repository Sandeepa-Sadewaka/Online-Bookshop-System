import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import '../../styles/Header.css';

function Header() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);

  // Check auth status on component mount and when navigating
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Changed from 'token' to match your login flow
    setIsLoggedIn(!!token);
  }, [navigate]); // Re-check when navigation occurs

  useEffect(() => {
    if (cart.length > 0) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <span className="logo-icon"></span>
            <span className="logo-text">BookVerse</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <input type="checkbox" id="navbar-toggle" className="navbar-toggle" />
        <label htmlFor="navbar-toggle" className="navbar-toggle-label">
          <span className="navbar-toggle-icon"></span>
        </label>

        {/* Navigation Links */}
        <nav className="navbar-menu">
          <ul className="navbar-links">
            <li className="navbar-item">
              <Link to="/" className="navbar-link">Home</Link>
            </li>
            <li className="navbar-item">
              <Link to="/books" className="navbar-link">Books</Link>
            </li>
            
            {/* Improved Auth Links */}
            {isLoggedIn ? (
              <>
                <li className="navbar-item">
                  <Link to="/profile" className="navbar-link">Profile</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/order" className="navbar-link">My Orders</Link>
                </li>
              </>
            ) : (
              <>
                <li className="navbar-item">
                  <Link to="/login" className="navbar-link">Login</Link>
                </li>
                <li className="navbar-item">
                  <Link to="/register" className="navbar-link">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Cart Icon */}
        <div className="navbar-cart">
          <button 
            onClick={() => navigate('/cart')} 
            className={`cart-button ${cartPulse ? 'cart-pulse' : ''}`}
            aria-label="Shopping Cart"
          >
            <span className="cart-icon">🛒</span>
            {cart.length > 0 && (
              <span className="cart-badge">{cart.length}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;