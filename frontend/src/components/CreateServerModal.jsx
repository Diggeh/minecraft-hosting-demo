import React, { useState } from "react";
import Button from "./Button";
import "../styles/CreateServerModal.css";

const CreateServerModal = ({ isOpen, onClose }) => {
    const [selectedPlan, setSelectedPlan] = useState("tropa");
    const [selectedDuration, setSelectedDuration] = useState("2-weeks");
    const [serverType, setServerType] = useState("new");
    const [serverName, setServerName] = useState("");
    const [mcVersion, setMcVersion] = useState("1.20.4");

    if (!isOpen) return null;

    const plans = [
        {
            id: "tropa",
            name: "Tropa",
            ram: "XGB RAM",
            players: "Up to X players",
            storage: "XXGB NVMe Storage",
            location: "Manila Server",
        },
        {
            id: "barkada",
            name: "Barkada",
            ram: "XGB RAM",
            players: "Up to X players",
            storage: "XXGB NVMe Storage",
            location: "Manila Server",
        },
        {
            id: "barangay",
            name: "Barangay",
            ram: "XGB RAM",
            players: "Up to X players",
            storage: "XXGB NVMe Storage",
            location: "Manila Server",
        },
    ];

    const durations = [
        { id: "2-weeks", label: "2 weeks", price: "Php XXXX.XX" },
        { id: "1-month", label: "1 month", price: "Php XXXX.XX" },
        { id: "6-months", label: "6 months", price: "Php XXXX.XX" },
        { id: "1-year", label: "1 year", price: "Php XXXX.XX", tag: "Best Value" },
    ];

    const handleContinue = () => {
        console.log("Proceeding to payment with configuration:", {
            selectedPlan,
            selectedDuration,
            serverType,
            serverName,
            mcVersion
        });
        // Placeholder logic for payment
        alert("Proceeding to payment...");
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="creation-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h1>Start hosting your own Minecraft server today</h1>

                <div className="step-section">
                    <span className="step-label">Step 1: Select a plan</span>
                    <div className="plans-grid">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`plan-option ${selectedPlan === plan.id ? "selected" : ""}`}
                                onClick={() => setSelectedPlan(plan.id)}
                            >
                                <h3>{plan.name}</h3>
                                <div className="plan-specs">
                                    <p>{plan.ram}</p>
                                    <p>{plan.players}</p>
                                    <p>{plan.storage}</p>
                                    <p>{plan.location}</p>
                                </div>
                                <div className="radio-circle"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="config-layout">
                    <div className="config-column">
                        <span className="step-label">Step 2: Select server duration</span>
                        <div className="duration-list">
                            {durations.map((d) => (
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
                                    <span className="price-text">{d.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="config-column">
                        <span className="step-label">Step 3: Configure Settings</span>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Server Type</label>
                                <div className="type-options">
                                    <div
                                        className={`type-option ${serverType === 'new' ? 'selected' : ''}`}
                                        onClick={() => setServerType('new')}
                                    >
                                        <div className="radio-circle"></div>
                                        <span>New</span>
                                    </div>
                                    <div
                                        className={`type-option ${serverType === 'existing' ? 'selected' : ''}`}
                                        onClick={() => setServerType('existing')}
                                    >
                                        <div className="radio-circle"></div>
                                        <span>Existing</span>
                                    </div>
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
                                <div className="select-wrapper" style={{ position: 'relative', flex: 1 }}>
                                    <select
                                        className="form-select"
                                        value={mcVersion}
                                        onChange={(e) => setMcVersion(e.target.value)}
                                        style={{ width: '100%', appearance: 'none' }}
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
                    <Button className="continue-btn" onClick={handleContinue}>
                        Continue to Payment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateServerModal;
