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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Automatically redirect users to Landing page*/}
        <Route path="/" element={<LandingPage />} />

        {/* The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Placeholder for the Dashboard we will build next */}
        <Route
          path="/dashboard"
          element={
            <div style={{ color: "white", padding: "20px" }}>
              Dashboard Coming Soon...
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
