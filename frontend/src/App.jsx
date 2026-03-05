import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import our new page!
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import PaymentPage from "./pages/PaymentPage";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Automatically redirect users to Landing page*/}
        <Route path="/" element={<LandingPage />} />

        {/* The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<SignupPage />} />

        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
