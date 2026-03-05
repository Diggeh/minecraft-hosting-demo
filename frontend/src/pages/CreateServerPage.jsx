import React from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import plan1Image from "../assets/minecraft-image-2.png";
import plan2Image from "../assets/plan2-img.png";
import plan3Image from "../assets/plan3-img.png";
import iconLaptop from "../assets/icon-laptop.png";
import iconGroup from "../assets/icon-group.png";
import iconHarddrive from "../assets/icon-harddrive.png";
import iconLocation from "../assets/icon-location.png";
import "../styles/LandingPage.css"; // Reusing your existing plan grid styles

const CreateServerPage = () => {
  // We store the plans in an array to make the code cleaner and easier to map over
  const plans = [
    {
      id: "tropa",
      name: "Tropa",
      image: plan1Image,
      ram: "XGB RAM",
      players: "Up to X players",
      storage: "XXGB NVMe Storage",
      location: "Manila Server",
      price: "000",
    },
    {
      id: "barkada",
      name: "Barkada",
      image: plan2Image,
      ram: "XGB RAM",
      players: "Up to X players",
      storage: "XXGB NVMe Storage",
      location: "Manila Server",
      price: "000",
    },
    {
      id: "barangay",
      name: "Barangay",
      image: plan3Image,
      ram: "XGB RAM",
      players: "Up to X players",
      storage: "XXGB NVMe Storage",
      location: "Manila Server",
      price: "000",
    },
  ];

  const handleSelectPlan = (planId) => {
    console.log(`User selected the ${planId} plan!`);
    // Future step: Save the selected plan to state and move to the "Enter Server Name" step
  };

  return (
    <div
      className="create-server-container"
      style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}
    >
      <Navbar />

      <main
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem" }}
      >
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              color: "#0f172a",
              marginBottom: "0.5rem",
            }}
          >
            Choose Your Plan
          </h1>
          <p style={{ color: "#64748b" }}>
            Select the perfect server size for your group
          </p>
        </header>

        {/* Reusing the plans-container class from your LandingPage.css */}
        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="plan-card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h2>{plan.name}</h2>
              <img src={plan.image} alt={`${plan.name} plan`} />

              <div className="info-row">
                <img src={iconLaptop} alt="RAM" />
                <span className="info-text">{plan.ram}</span>
              </div>
              <div className="info-row">
                <img src={iconGroup} alt="Players" />
                <span className="info-text">{plan.players}</span>
              </div>
              <div className="info-row">
                <img src={iconHarddrive} alt="Storage" />
                <span className="info-text">{plan.storage}</span>
              </div>
              <div className="info-row">
                <img src={iconLocation} alt="Location" />
                <span className="info-text">{plan.location}</span>
              </div>

              <div className="pricing-row" style={{ marginBottom: "1.5rem" }}>
                <span className="currency">₱</span>
                <span className="amount">{plan.price}</span>
                <span className="slash">/</span>
                <span className="period">week</span>
              </div>

              {/* Push the button to the bottom of the card */}
              <div style={{ marginTop: "auto" }}>
                <Button
                  className="primary-btn"
                  style={{ width: "100%" }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Select Plan
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: "2rem" }}>
          *Plans are offered on a two-week basis, cancel anytime
        </p>
      </main>
    </div>
  );
};

export default CreateServerPage;
