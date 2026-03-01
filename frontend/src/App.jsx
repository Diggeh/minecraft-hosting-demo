import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import our new page!
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Automatically redirect people from the home page to the login screen */}
        <Route path="/" element={<Navigate to="/login" />} />

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
