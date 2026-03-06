import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom"; // 1. Added Link
import "./Navbar.css";
import logo from "../assets/logo.png";
import profileIcon from "../assets/icon_profile.svg";
import { AuthContext } from "../contexts/authContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isSignUpPage = location.pathname === "/register";
  const isServersPage = location.pathname === "/servers";
  const isProfilePage = location.pathname === "/profile";
  const showServersLink = user && (isServersPage || isProfilePage) ;

  const profilePath = user ? "/profile" : "/login";

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={logo} alt="BlockBayan Logo" />
          <h2>BlockBayan</h2>
        </Link>

        <nav className="navigation">
          {!isLoginPage && !isSignUpPage && !isServersPage && !isProfilePage && (
            <>
              <Link to="/#" onClick={() => window.scrollTo(0, 0)}>
                Home
              </Link>
              <a href="#plans">Plans</a>
              <a href="#features">Features</a>
              <a href="#contactus">Contact us</a>
            </>
          )}

          {showServersLink && (
            <Link to="/servers" className="nav-link">Servers</Link>
          )}

          <div className="auth-group">
            <div className="line"></div>
            <div className="profile-btn">
              {/* Change link and label based on authentication (login) status */}
              <Link to={profilePath}>
                <img src={profileIcon} alt={user ? "Profile" : "Login"} />
              </Link>
              <Link to={profilePath}>{user ? user.username : "Login"}</Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
