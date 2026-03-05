import React from "react";
import "../styles/PaymentPage.css";
import qrPlaceholder from "../assets/qr.png";

const PaymentPage = () => {
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Your Purchase</h1>
          <p>
            Scan the QR code below using your favorite banking or e-wallet app
            to pay.
          </p>
        </div>

        <div className="qr-section">
          <div className="qr-wrapper">
            <img
              src={qrPlaceholder}
              alt="QRPH Payment Code"
              className="qr-code"
            />
            <div className="qr-border tl"></div>
            <div className="qr-border tr"></div>
            <div className="qr-border bl"></div>
            <div className="qr-border br"></div>
          </div>
          <div className="qr-details">
            <div className="merchant-info">
              <span className="label">Merchant:</span>
              <span className="value">BlockBayan</span>
            </div>
            <div className="amount-info">
              <span className="label">Amount Due:</span>
              <span className="value accent">₱000.00</span>
            </div>
          </div>
        </div>

        <div className="payment-instructions">
          <h2>Instructions:</h2>
          <ol>
            <li>Open your GCash, Maya, or any QRPH-supported app.</li>
            <li>Scan the QR code.</li>
            <li>Verify the amount and merchant details.</li>
            <li>Confirm the payment in your app.</li>
          </ol>
          <p className="note">
            Keep this page open. Your account will be upgraded automatically
            once payment is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
