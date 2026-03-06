import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import api from "../services/api";
import "../styles/LandingPage.css";
import Button from "../components/Button";
import bgImage from "../assets/minecraft-image-1.png";
import plan1Image from "../assets/minecraft-image-2.png";
import plan2Image from "../assets/plan2-img.png";
import plan3Image from "../assets/plan3-img.png";
import iconLaptop from "../assets/icon-laptop.png";
import iconGroup from "../assets/icon-group.png";
import iconHarddrive from "../assets/icon-harddrive.png";
import iconLocation from "../assets/icon-location.png";
import iconGlobe from "../assets/icon-globe.svg";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section id="home">
        <div className="hero-section">
          <div className="left-section">
            <img src={bgImage} className="page-bg" alt="" />
          </div>
          <div className="right-section">
            <div className="hero-label">
              Explore endless possibilities with your friends
            </div>
            <Button text="Start your server today" className="btn-primary" />
          </div>
        </div>
      </section>

      <section id="plans" className="plans-section">
        <h1>Plans</h1>
        <div className="plans-container">
          <div className="plan-card">
            <h2>Tropa</h2>
            <img src={plan1Image} alt="Plan 1 image" />
            <div className="info-row">
              <img src={iconLaptop} alt="Icon" />
              <span className="info-text">4GB RAM</span>
            </div>
            <div className="info-row">
              <img src={iconGroup} alt="Icon" />
              <span className="info-text">Up to 5 players</span>
            </div>
            <div className="info-row">
              <img src={iconLocation} alt="Icon" />
              <span className="info-text">Manila Server</span>
            </div>
            <div className="pricing-row">
              <span className="currency">₱</span>
              <span className="amount">75</span>
              <span className="slash">/</span>
              <span className="period">week</span>
            </div>
          </div>

          <div className="plan-card">
            <h2>Barkada</h2>
            <img src={plan2Image} alt="Plan 2 image" />
            <div className="info-row">
              <img src={iconLaptop} alt="Icon" />
              <span className="info-text">6GB RAM</span>
            </div>
            <div className="info-row">
              <img src={iconGroup} alt="Icon" />
              <span className="info-text">Up to 10 players</span>
            </div>
            <div className="info-row">
              <img src={iconLocation} alt="Icon" />
              <span className="info-text">Manila Server</span>
            </div>
            <div className="pricing-row">
              <span className="currency">₱</span>
              <span className="amount">125</span>
              <span className="slash">/</span>
              <span className="period">week</span>
            </div>
          </div>

          <div className="plan-card">
            <h2>Barangay</h2>
            <img src={plan3Image} alt="Plan 3 image" />
            <div className="info-row">
              <img src={iconLaptop} alt="Icon" />
              <span className="info-text">8GB RAM</span>
            </div>
            <div className="info-row">
              <img src={iconGroup} alt="Icon" />
              <span className="info-text">Up to 10 players</span>
            </div>
            <div className="info-row">
              <img src={iconLocation} alt="Icon" />
              <span className="info-text">Manila Server</span>
            </div>
            <div className="pricing-row">
              <span className="currency">₱</span>
              <span className="amount">180</span>
              <span className="slash">/</span>
              <span className="period">week</span>
            </div>
          </div>
        </div>
        <p>*Plans are offered on a two-week basis, cancel anytime</p>
      </section>

      <section id="features" className="features-section">
        <h1>Features</h1>
        <div className="features-container">
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 1</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 2</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 3</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 4</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 5</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
          <div className="features-card">
            <img src={iconGlobe} alt="" />
            <h2>Feature 6</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
              ducimus omnis quo similique. Quas maxime repellat doloremque,
              libero qui asperiores molestias, perferendis deserunt adipisci
              reiciendis quia possimus harum! Voluptas, quis.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
