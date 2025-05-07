// src/components/Common/ErrorMessage.jsx
import React from 'react';
import '../../styles/ErrorMessage.css';

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;