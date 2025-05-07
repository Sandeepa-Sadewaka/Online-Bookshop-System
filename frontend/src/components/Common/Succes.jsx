import React from 'react';
import '../../styles/SuccessSreen.css'; // Assuming you have a CSS file for styling
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';

const Success = () => {
  return (
    <><><Header /><div className="success-page">
          <h1>Thank you for your purchase!</h1>
          <p>Your order has been received and is being processed.</p>
      </div></><Footer /></>
  );
};

export default Success;
