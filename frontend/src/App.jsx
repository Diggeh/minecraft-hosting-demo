import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CreateServerPage from "./pages/CreateServerPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import ServerListPage from "./pages/ServerListPage"; // 1. Import your new page

// 2. Import the AuthContext so we can check if a user is logged in
import { AuthContext } from "./contexts/authContext";

// 3. Create a wrapper component to protect private routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait for the auth context to finish checking localStorage
  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  // If no user is found, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, render the requested page (ServerListPage)
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />

        {/* 4. The newly protected Server List route */}
        <Route
          path="/servers"
          element={
            <ProtectedRoute>
              <ServerListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-server"
          element={
            <ProtectedRoute>
              <CreateServerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
