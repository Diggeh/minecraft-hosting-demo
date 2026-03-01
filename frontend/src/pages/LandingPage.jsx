import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import api from "../services/api";
import "./LandingPage.css";
import Button from "../components/Button";
import bgImage from "../assets/minecraft-image-1.png";

const LandingPage = () => {
    return (
        <div className="landing-page">
            <img src={bgImage} className="page-bg" alt="" />
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Explore endless possibilities <br />with your friends</h1>
                    <div className = "hero-action">
                        <h2>Start your server today</h2>
                        <Button text="Start now" className="btn-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;