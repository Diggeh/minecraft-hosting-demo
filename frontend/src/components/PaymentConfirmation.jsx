import { useState } from "react";
import "../styles/PaymentConfirmation.css";
import { Link, useNavigate } from "react-router-dom";

const PaymentConfirmation = ({ isOpen, onClose, orderDetails }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const { planName, duration, serverName, mcVersion, price } = orderDetails;

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-wrapper" onClick={(e) => e.stopPropagation()}>
        <button className="pc-close-btn" onClick={onClose}>
          x
        </button>

        <h1 className="pc-title">Order Summary</h1>

        <div className="pc-card">
          <div className="pc-card-title">
            Minecraft Server - {planName} Plan
          </div>
          <div className="pc-card-detail">Duration: {duration}</div>
          <div className="pc-card-detail">Server name: {serverName || "—"}</div>
          <div className="pc-card-detail">Minecraft Version: {mcVersion}</div>
        </div>

        <div className="pc-pricing">
          <div className="pc-pricing-row">
            <span className="pc-pricing-label">Price:</span>
            <span className="pc-pricing-value">₱ {price}.00</span>
          </div>
        </div>

        <hr className="pc-divider" />

        <div className="pc-total-row">
          <span className="pc-total-label">Total Amount Payable:</span>
          <span className="pc-total-value">₱ {price}.00</span>
        </div>

        <button
          className="pc-button"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => {
            navigate("/payment", {
              state: { plan: { name: planName, price: price } },
            });
          }}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
