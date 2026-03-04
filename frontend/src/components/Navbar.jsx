import React from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";
import profileIcon from "../assets/icon_profile.svg";

export default function Navbar() {
  const location = useLocation();

  // Check if user is on Login Page
  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/register";

  return (
    <header className="main-header">
      <div className="header-container">
        <a href="/" className="logo">
          <img src={logo} alt="BlockBayan Logo" />
          <h2>BlockBayan</h2>
        </a>

        <nav className="navigation">
          <a href="/">Home</a>

          {/* Only show these links if NOT on login page */}
          {(!isLoginPage && !isSignUpPage) && (
            <>
              <a href="#plans">Plans</a>
              <a href="/features">Features</a>
              <a href="/contactus">Contact us</a>
            </>
          )}

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
  );
}