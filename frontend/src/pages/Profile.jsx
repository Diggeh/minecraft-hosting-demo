import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import profileIcon from "../assets/icon_profile.svg"
import cardIcon from "../assets/icon-credit-card.svg"
import moneyBagIcon from "../assets/icon-money-bag";
import "../styles/Profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="profile-container">
      <aside className="sidebar">
        <div className="user-section">
          <div className="profile-avatar">
            <img src={profileIcon} alt="" />  
          </div>
          <h2 className="username">{user.username}</h2>
          <h1>{user.email}</h1>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-label">Billing</p>
          <div className="nav-item">
            <img src={cardIcon} className="nav-item-icon" alt="credit-card-icon" />
            <h3>Transactions</h3>
          </div>
          <div className="nav-item">
            <img src={moneyBagIcon} className="nav-item-icon" alt="money-bag-icon" />
            <h3>Transactions</h3>
          </div>
        </nav>

        <button className= "logout-btn" onClick={logout}>
          <Link to="/" className="logout-link">Logout and return</Link>
        </button>
      </aside>
    </div>
  );
};

export default Profile;
