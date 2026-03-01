import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import api from "../services/api";
import "../styles/App.css"; // We'll put our styles here

const LoginPage = () => {
  // 1. Set up memory for what the user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 2. Bring in the global login function from our Context
  const { login } = useContext(AuthContext);

  // 3. What happens when they click "Login"
  const handleLogin = async (e) => {
    e.preventDefault(); // Stop the page from refreshing
    setError(""); // Clear any old errors

    try {
      // Send the request to your Express backend
      // (Make sure this URL matches your actual backend auth route!)
      const response = await api.post("/users/login", { email, password });

      // Save their info to global memory
      login(response.data, response.data.token);

      // Send them to the dashboard (we will build this routing next!)
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        {/* Placeholder for your background characters */}
        <h1 className="login-title">Start your adventure today</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <p className="input-label">Login</p>

          {/* Horizontal Layout matching your Figma */}
          <div className="input-row">
            <div className="input-wrapper">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <span className="icon">🔑</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="icon-right">👁️</span>
            </div>

            <button type="submit" className="btn-login">
              Login
            </button>
          </div>

          {/* Error Message Display */}
          {error && <p className="error-text">{error}</p>}

          <div className="form-links">
            <a href="#" className="cyan-link">
              Forgot password?
            </a>
          </div>

          {/* Google Auth Placeholder */}
          <button type="button" className="btn-google">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
              className="google-icon"
            />
            Sign in with Google
          </button>

          <p className="signup-text">
            Dont have an account?{" "}
            <a href="/register" className="cyan-link">
              Sign up here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
