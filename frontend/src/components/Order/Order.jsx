import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../styles/OrderScreen.css';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  // Extract session_id from URL query params
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No order session found');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch order details from your backend
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/orders/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrderDetails(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, navigate]);

  const handleResendEmail = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/resend-confirmation`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (err) {
      console.error('Error resending email:', err);
      setError('Failed to resend confirmation email');
    }
  };

  if (loading) {
    return (
      <div className="order-loading">
        <div className="spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="home-button">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="order-header">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="order-number">Order #: {orderDetails?.orderId || sessionId}</p>
        </div>

        <div className="order-details">
          <h2>Your order is complete</h2>
          <p>
            A confirmation email has been sent to{' '}
            <strong>{orderDetails?.customerEmail || 'your email'}</strong>
          </p>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="items-list">
              {orderDetails?.items?.map((item) => (
                <div key={item.productId} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${orderDetails?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>${orderDetails?.shipping?.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>${orderDetails?.tax?.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${orderDetails?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <p>
              <strong>Address:</strong> {orderDetails?.shippingAddress?.line1}
              {orderDetails?.shippingAddress?.line2 && `, ${orderDetails.shippingAddress.line2}`}
              <br />
              {orderDetails?.shippingAddress?.city}, {orderDetails?.shippingAddress?.state}{' '}
              {orderDetails?.shippingAddress?.postal_code}
              <br />
              {orderDetails?.shippingAddress?.country}
            </p>
            <p>
              <strong>Estimated Delivery:</strong>{' '}
              {orderDetails?.estimatedDelivery || '3-5 business days'}
            </p>
          </div>
        </div>

        <div className="order-actions">
          <button onClick={() => navigate('/')} className="action-button">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/orders')} className="action-button">
            View All Orders
          </button>
          <button
            onClick={handleResendEmail}
            disabled={emailSent}
            className="action-button"
          >
            {emailSent ? 'Email Sent!' : 'Resend Confirmation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;