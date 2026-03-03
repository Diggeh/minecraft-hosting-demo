import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import profileIcon from "../assets/icon_profile.svg";

export default function Navbar() {
  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <a href="/" className="logo">
            <img src={logo} alt="BlockBayan Logo" />
            <h2>BlockBayan</h2>
          </a>
          <nav className="navigation">
            <a href="/">Home</a>
            <a href="#plans">Plans</a>
            <a href="/features">Features</a>
            <a href="/contactus">Contact us</a>

            <div className="auth-group">
              <div className="line"></div>
              <div className="profile-btn">
                <a href="/login">
                  <img src={profileIcon} alt="Login" />
                </a>
                <a href="/login">Login</a>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
