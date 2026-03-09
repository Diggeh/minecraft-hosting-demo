import React, { useState, useEffect } from "react";
import { getPlans } from "../services/api";
import { Helmet } from "react-helmet-async";
import "../styles/LandingPage.css";
import Button from "../components/Button";
import bgImage from "../assets/minecraft-image-1.png";
import plan1Image from "../assets/minecraft-image-2.png";
import plan2Image from "../assets/plan2-img.png";
import plan3Image from "../assets/plan3-img.png";
import iconLaptop from "../assets/icon-laptop.png";
import iconGroup from "../assets/icon-group.png";
import iconLocation from "../assets/icon-location.png";
import iconGlobe from "../assets/icon-globe.svg";
import { Link } from "react-router-dom";

// Map plan slugs to their respective images (add more as needed)
const planImages = {
  tropa: plan1Image,
  barkada: plan2Image,
  barangay: plan3Image,
};

const LandingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetched = await getPlans();
        setPlans(fetched);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="landing-page">
      <Helmet>
        <title>BlockBayan</title>
      </Helmet>
      <section id="home">
        <div className="hero-section">
          <div className="left-section">
            <img src={bgImage} className="page-bg" alt="" />
          </div>
          <div className="right-section">
            <div className="hero-label">
              Explore endless possibilities with your friends
            </div>

            <Link to="/login">
              <Button text="Start your server today" className="btn-primary" />
            </Link>
          </div>
        </div>
      </section>

      <section id="plans" className="plans-section">
        <h1>Plans</h1>
        <div className="plans-container">
          {loadingPlans ? (
            <p>Loading plans...</p>
          ) : (
            plans.map((plan) => (
              <div className="plan-card" key={plan._id}>
                <h2>{plan.name}</h2>
                <img
                  src={planImages[plan.slug] || plan1Image}
                  alt={`${plan.name} plan`}
                />
                <div className="info-row">
                  <img src={iconLaptop} alt="Icon" />
                  <span className="info-text">{plan.ram / 1024}GB RAM</span>
                </div>
                <div className="info-row">
                  <img src={iconGroup} alt="Icon" />
                  <span className="info-text">
                    Up to {plan.maxPlayers} players
                  </span>
                </div>
                <div className="info-row">
                  <img src={iconLocation} alt="Icon" />
                  <span className="info-text">Manila Server</span>
                </div>
                <div className="pricing-row">
                  <span className="currency">₱</span>
                  <span className="amount">{plan.price}</span>
                  <span className="slash">/</span>
                  <span className="period">week</span>
                </div>
              </div>
            ))
          )}
        </div>
        <p>*Plans are offered on a two-week basis, cancel anytime</p>
      </section>

      <section id="features" className="features-section">
        <h1>Features</h1>
        <div className="features-container">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="features-card" key={n}>
              <img src={iconGlobe} alt="" />
              <h2>Feature {n}</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Expedita ducimus omnis quo similique. Quas maxime repellat
                doloremque, libero qui asperiores molestias, perferendis
                deserunt adipisci reiciendis quia possimus harum! Voluptas,
                quis.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
