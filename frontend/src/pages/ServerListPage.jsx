import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { getUserServers } from "../services/api"; // Import your new API function
import harddriveIcon from "../assets/icon-harddrive.png";
import groupIcon from "../assets/icon-group.png";
import "../styles/ServerListPage.css";

const ServerListPage = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch the servers when the component mounts
    const fetchServers = async () => {
      try {
        const data = await getUserServers();
        setServers(data);
      } catch (err) {
        setError("Failed to load your servers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  return (
    <div className="server-list-container">
      <main className="server-list-content">
        <header className="server-list-header">
          <h1>My Active Servers</h1>
          <Button className="primary-btn">Rent New Server</Button>
        </header>

        {/* Handle Loading & Error States */}
        {loading && <p>Loading your servers...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && servers.length === 0 && (
          <p>You don't have any active servers yet!</p>
        )}

        <div className="server-grid">
          {servers.map((server) => (
            // Use the MongoDB _id for the React key
            <div key={server._id} className="server-card">
              <div className="server-card-header">
                {/* Map to your DB schema's 'serverName' */}
                <h2>{server.serverName}</h2>
                <span className={`status-badge ${server.status.toLowerCase()}`}>
                  {server.status}
                </span>
              </div>

              <div className="server-details">
                <p>
                  <img
                    src={harddriveIcon}
                    alt="Plan Icon"
                    className="inline-icon"
                  />
                  {/* We are mocking the plan/players/expires since they aren't in your DB schema yet */}
                  Standard Plan
                </p>
                <p>
                  <img
                    src={groupIcon}
                    alt="Group Icon"
                    className="inline-icon"
                  />
                  Unknown Players
                </p>
                <div className="ip-container">
                  {/* We display the actual port from the DB to help with local testing */}
                  <strong>Local Port:</strong> <code>{server.port}</code>
                </div>
                <p className="expiry-text">Expires: TBD</p>
              </div>

              <div className="server-actions">
                <Button className="secondary-btn">Manage</Button>
                <Button
                  className={
                    server.status === "running" ? "danger-btn" : "success-btn"
                  }
                >
                  {server.status === "running" ? "Stop Server" : "Start Server"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ServerListPage;
