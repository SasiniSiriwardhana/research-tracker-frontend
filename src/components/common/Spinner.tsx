import React from 'react';

const Spinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">{message}</span>
    </div>
    <p className="mt-3 text-muted fw-semibold">{message}</p>
  </div>
);

export default Spinner;
