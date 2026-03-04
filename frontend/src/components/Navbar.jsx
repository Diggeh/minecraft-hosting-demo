import React from "react";
import { useLocation, Link } from "react-router-dom"; // 1. Added Link
import "./Navbar.css";
import logo from "../assets/logo.png";
import profileIcon from "../assets/icon_profile.svg";

export default function Navbar() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/register";

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={logo} alt="BlockBayan Logo" />
          <h2>BlockBayan</h2>
        </Link>

        <nav className="navigation">
          <Link to="/#" onClick={() => window.scrollTo(0, 0)}>Home</Link>

          {!isLoginPage && !isSignUpPage && (
            <>
              <a href="#plans">Plans</a>
              <Link to="/features">Features</Link>
              <Link to="/contactus">Contact us</Link>
            </>
          )}

          <div className="auth-group">
            <div className="line"></div>
            <div className="profile-btn">
              <Link to="/login">
                <img src={profileIcon} alt="Login" />
              </Link>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}