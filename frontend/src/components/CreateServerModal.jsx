import React, { useState, useEffect } from "react";
import Button from "./Button";
import PaymentConfirmation from "./PaymentConfirmation";
import { getPlans } from "../services/api";
import "../styles/CreateServerModal.css";

// Duration multipliers relative to the base price (per week)
const DURATION_OPTIONS = [
  { id: "2-weeks", label: "2 weeks", weeks: 2 },
  { id: "1-month", label: "1 month", weeks: 4 },
  { id: "6-months", label: "6 months", weeks: 24 },
  { id: "1-year", label: "1 year", weeks: 48, tag: "Best Value" },
];

const CreateServerModal = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("2-weeks");
  const [serverType, setServerType] = useState("new");
  const [serverName, setServerName] = useState("");
  const [mcVersion, setMcVersion] = useState("1.20.4");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPlans = async () => {
      try {
        const fetched = await getPlans();
        setPlans(fetched);
        if (fetched.length > 0) setSelectedPlan(fetched[0].slug);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [isOpen]);

  const handleClose = () => {
    setSelectedPlan(plans[0]?.slug ?? null);
    setSelectedDuration("2-weeks");
    setServerType("new");
    setServerName("");
    setMcVersion("1.20.4");
    setShowPayment(false);
    onClose();
  };

  if (!isOpen) return null;

  // Helper: calculate price for a given plan + duration
  const getPrice = (plan, durationId) => {
    const dur = DURATION_OPTIONS.find((d) => d.id === durationId);
    return plan ? plan.price * dur.weeks : 0;
  };

  const selectedPlanData = plans.find((p) => p.slug === selectedPlan);

  const orderDetails = selectedPlanData
    ? {
        planId: selectedPlanData._id,
        planName: selectedPlanData.name,
        duration: selectedDuration,
        serverName,
        mcVersion,
        price: getPrice(selectedPlanData, selectedDuration),
      }
    : null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div
          className="creation-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-modal-btn" onClick={handleClose}>
            <span className="material-symbols-outlined">x</span>
          </button>

          <h1>Start hosting your own Minecraft server today</h1>

          {/* Step 1: Plan */}
          <div className="step-section">
            <span className="step-label">Step 1: Select a plan</span>
            {loadingPlans ? (
              <p>Loading plans...</p>
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`plan-option ${selectedPlan === plan.slug ? "selected" : ""}`}
                    onClick={() => setSelectedPlan(plan.slug)}
                  >
                    <h3>{plan.name}</h3>
                    <div className="plan-specs">
                      <p>{plan.ram / 1024}GB RAM</p>
                      <p>Up to {plan.maxPlayers} players</p>
                      <p>Manila Server</p>
                    </div>
                    <div className="radio-circle"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="config-layout">
            {/* Step 2: Duration */}
            <div className="config-column">
              <span className="step-label">Step 2: Select server duration</span>
              <div className="duration-list">
                {DURATION_OPTIONS.map((d) => (
                  <div
                    key={d.id}
                    className={`duration-option ${selectedDuration === d.id ? "selected" : ""}`}
                    onClick={() => setSelectedDuration(d.id)}
                  >
                    <div className="duration-info">
                      <div className="radio-circle"></div>
                      <span>{d.label}</span>
                      {d.tag && <span className="best-value">{d.tag}</span>}
                    </div>
                    <span className="price-text">
                      Php {getPrice(selectedPlanData, d.id)}.00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Settings */}
            <div className="config-column">
              <span className="step-label">Step 3: Configure Settings</span>
              <div className="settings-form">
                <div className="form-group">
                  <label>Server Type</label>
                  <div className="type-options">
                    {["new", "existing"].map((type) => (
                      <div
                        key={type}
                        className={`type-option ${serverType === type ? "selected" : ""}`}
                        onClick={() => setServerType(type)}
                      >
                        <div className="radio-circle"></div>
                        <span>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Server Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Enter server name"
                  />
                </div>

                <div className="form-group">
                  <label>Minecraft Version</label>
                  <div
                    className="select-wrapper"
                    style={{ position: "relative", flex: 1 }}
                  >
                    <select
                      className="form-select"
                      value={mcVersion}
                      onChange={(e) => setMcVersion(e.target.value)}
                      style={{ width: "100%", appearance: "none" }}
                    >
                      <option value="1.20.4">1.20.4</option>
                      <option value="1.20.1">1.20.1</option>
                      <option value="1.19.4">1.19.4</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <Button
              className="continue-btn"
              onClick={() => setShowPayment(true)}
              disabled={!selectedPlanData}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      {orderDetails && (
        <PaymentConfirmation
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderDetails={orderDetails}
        />
      )}
    </>
  );
};

export default CreateServerModal;
