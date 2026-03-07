import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";
import "../styles/PaymentPage.css";

const DEFAULT_PLAN = { name: "Starter", price: 249 };

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hasFetched = useRef(false);

  // Directly use location.state.plan or the stable DEFAULT_PLAN
  const requestedPlan = location.state?.plan || DEFAULT_PLAN;

  const [status, setStatus] = useState("pending");
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localIp, setLocalIp] = useState("");

  const API_BASE = `${import.meta.env.VITE_URL}/api`;

  useEffect(() => {
    if (hasFetched.current) return; // block second run
    hasFetched.current = true;

    const initPage = async () => {
      try {
        console.count("🔄 Payment session creation attempt");
        const payRes = await axios.post(`${API_BASE}/payments/create`, {
          userId: "65e69e776077556066777777",
          planId: requestedPlan.name,
          amount: requestedPlan.price,
        });
        setPayment(payRes.data);

        try {
          const ipRes = await axios.get(`${API_BASE}/status/ip`);
          setLocalIp(ipRes.data.ip);
        } catch (ipErr) {
          console.warn(
            "Could not discover local IP, falling back to localhost",
          );
          setLocalIp("localhost");
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []); // run once to avoid duplication in database

  useEffect(() => {
    if (!payment || status === "completed") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/payments/${payment._id}/status`,
        );
        if (res.data.status === "completed") {
          setStatus("completed");
          clearInterval(interval);
          setTimeout(() => navigate("/servers"), 3000);
        }
      } catch (err) {
        console.error("Error polling payment status", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [payment, status, navigate]);

  if (loading)
    return <div className="payment-page">Loading payment session...</div>;

  const scanLink = `http://${localIp || "localhost"}:5000/api/payments/scan/demo`;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>
            {status === "completed"
              ? "Payment Successful!"
              : "Complete Your Purchase"}
          </h1>
          <p>
            {status === "completed"
              ? "We've confirmed your payment. Preparing your server..."
              : `Scan the QR code below with your phone (on the same Wi-Fi) to activate your server.`}
          </p>
        </div>

        <div className="qr-section">
          <div className="qr-wrapper">
            {status === "completed" ? (
              <div
                className="success-icon"
                style={{
                  fontSize: "100px",
                  textAlign: "center",
                  display: "block",
                  color: "#4caf50",
                }}
              >
                ✅
              </div>
            ) : (
              <div className="qr-box">
                {localIp ? (
                  <QRCode
                    value={scanLink}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <div className="loading-qr">Generating QR...</div>
                )}
              </div>
            )}
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
              <span className="value accent">₱{requestedPlan.price}.00</span>
            </div>
          </div>
        </div>

        <div className="payment-footer">
          <button className="cancel-btn" onClick={() => navigate("/servers")}>
            Cancel Payment
          </button>
        </div>

        {status !== "completed" && (
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
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
