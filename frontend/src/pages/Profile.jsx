import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/authContext";
import profileIcon from "../assets/icon_profile.svg"
import toolIcon from "../assets/icon-tools.svg";
import "../styles/Profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);  

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    
    if (!usernameRegex.test(username)) {
        setError(
          "Username must be 4-20 characters and contain only letters, numbers, or underscores.",
        );
        return;
    }

    // Handle username update here
  }

  return (
    <div className="profile-container">
      <aside className="sidebar">
        <div className="user-section">
          <div className="profile-avatar">
            <img src={profileIcon} alt="" />  
          </div>
          <p className="username">{user.username}</p>
        </div>

        <nav className="sidebar-nav"> 
          <p className="nav-group-label">User</p>
          <div className="nav-item">
            <img src={toolIcon} className="nav-item-icon" alt="tool-icon" />
            <h3>Account Settings</h3>
          </div>
        </nav>

        <button className= "logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <form className="account-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Account Settings</h2>

          <div className="profile-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={user.username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              readOnly
            />
          </div>

          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
