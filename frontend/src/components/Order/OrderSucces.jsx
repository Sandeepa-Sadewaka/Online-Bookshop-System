import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderSuccess.css';

function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-success-container">
      <div className="success-message">
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase.</p>
      </div>
      
      <div className="order-details">
        <h2>Order #{order._id}</h2>
        <p>Status: {order.status}</p>
        <p>Total: ${order.total.toFixed(2)}</p>
        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div className="order-items">
        <h3>Items:</h3>
        {order.items.map((item, index) => (
          <div key={index} className="order-item">
            <p>{item.product.title} (x{item.quantity})</p>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      
      <button onClick={() => navigate('/')} className="continue-shopping">
        Continue Shopping
      </button>
    </div>
  );
}

export default OrderSuccess;