import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import api from "../services/api";
import iconMail from "../assets/icon_mail.svg";
import iconKey from "../assets/icon_key.svg";
import iconEyeClosed from "../assets/icon_eye_closed.svg";
import "../styles/LoginPage.css"; 


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(""); 

    try {
      const response = await api.post("/users/login", { email, password });

      login(response.data, response.data.token);

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <h1 className="login-title">Start your adventure today</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <p className="input-label">Login</p>

          <div className="input-row">
            <div className="input-wrapper">
              <img src={iconMail} />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <img src={iconKey} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img src={iconEyeClosed} />
            </div>

            <button type="submit" className="btn-login">
              Login
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-links">
            <a href="#" className="cyan-link">
              Forgot password?
            </a>
          </div>

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
