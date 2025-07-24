import React, { useEffect } from 'react';
import rejectedImage from '../assets/rejected.jpg';


const RejectedPurchaseComponent = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="thank-you-container">
      <div className="animated-overlay"></div>

      <img src={rejectedImage} alt="Purchase Rejected" className="full-image" />

      <div className="center-content">
        <div className="thank-you-text">Lo sentimos, tu compra no pudo ser procesada.</div>
      </div>
    </div>
  );
};

export default RejectedPurchaseComponent;