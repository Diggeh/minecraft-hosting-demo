import React from "react";
import iconPerson from "../assets/icon_person.svg";
import iconMail from "../assets/icon_mail.svg";
import iconKey from "../assets/icon_key.svg";
import iconEyeClosed from "../assets/icon_eye_closed.svg";
import "../styles/SignupPage.css";
import { useState } from "react";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (passwords.password != passwords.confirmPassword) {
      setError("Passwords do not match!")
      return;
    }

    try {
      const response = await api.post("users/register", { username, email, passwords: passwords.password })
    } catch (err) {
      setError("Failed to register. Try again.")
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-title-page">
        <p>Create an account now</p>
      </div>
      <form className="signup-body">
        <p className="signup-body-label">Signup</p>
        <div className="signup-input-container">
          <div className="signup-input-body forty">
            <img src={iconPerson} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="signup-input-body sixty">
            <img src={iconMail} />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="signup-input-body wide">
            <img src={iconKey} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={passwords.password}
              onChange={handlePasswordChange}
              required
            />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <div className="signup-input-body wide">
            <img src={iconKey} />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <button className="signup-btn">Sign up</button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
