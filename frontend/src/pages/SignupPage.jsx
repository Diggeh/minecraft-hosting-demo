import React from "react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import api from "../services/api";
import iconPerson from "../assets/icon_person.svg";
import iconMail from "../assets/icon_mail.svg";
import iconKey from "../assets/icon_key.svg";
import iconEyeClosed from "../assets/icon_eye_closed.svg";
import iconEyeOpen from "../assets/icon_eye_open.svg";
import "../styles/SignupPage.css";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Typing in password or showPassword field will update only the password state
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const password = passwords.password;

  const isValidated = () => {
    // Username: 4-20 chars, number, or underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      setError(
        "Username must be 4-20 characters and contain only letters, numbers, or underscores.",
      );
      return false;
    }

    // Email: must have @_.com
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    if (passwords.password != passwords.confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidated()) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
      });
      setSuccess("Signup successful! You can now log in.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Helmet>
        <title>Sign-up</title>
      </Helmet>
      <div className="signup-title-page">
        <p>Create an account now</p>
      </div>
      <form className="signup-body" onSubmit={handleRegister}>
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
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={passwords.password}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="input-wrapper-button"
            >
              <img
                src={showPassword ? iconEyeOpen : iconEyeClosed}
                alt={showPassword ? "Hide password" : "Show password"}
              />
            </button>
          </div>
          <div className="signup-input-body wide">
            <img src={iconKey} />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="input-wrapper-button"
            >
              <img
                src={showConfirmPassword ? iconEyeOpen : iconEyeClosed}
                alt={showConfirmPassword ? "Hide password" : "Show password"}
              />
            </button>
          </div>
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
          {error && <p className="signup-error-text">{error}</p>}
          {success && <p className="signup-success-text">{success}</p>}
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
