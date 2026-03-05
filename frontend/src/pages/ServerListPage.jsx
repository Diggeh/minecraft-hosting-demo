import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { getUserServers } from "../services/api";
import "../styles/ServerListPage.css";

const ServerListPage = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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
        {/* UPDATED HEADER SECTION */}
        <header className="server-list-header">
          <div className="header-titles">
            <h1>Your Servers</h1>
            <p className="subtitle">
              Manage all your game servers in one place
            </p>
          </div>
          <Button
            className="primary-btn create-btn"
            onClick={() => navigate("/create-server")}
          >
            Create Server +
          </Button>
        </header>

        {loading && <p className="status-message">Loading your servers...</p>}
        {error && <p className="status-message error">{error}</p>}
        {!loading && servers.length === 0 && (
          <p className="status-message">
            You don't have any active servers yet!
          </p>
        )}

        <div className="server-grid">
          {servers.map((server) => (
            <div key={server._id} className="server-card">
              {/* UPDATED CARD HEADER */}
              <div className="server-card-header">
                <h2>{server.serverName}</h2>
                <button className="options-menu-btn">•••</button>
              </div>

              {/* UPDATED CARD BODY */}
              <div className="server-details">
                <p className="ip-label">Server IP</p>
                <div className="ip-container">
                  <code>Placeholder Server.IP:{server.port}</code>
                </div>

                <div className="status-row">
                  <span className="status-dot online"></span>
                  <span className="status-text">
                    {server.status || "Running"}
                  </span>
                </div>
              </div>

              <div className="server-actions">
                <Button
                  className={
                    server.status === "running" ? "danger-btn" : "success-btn"
                  }
                >
                  {server.status === "running" ? "Stop" : "Start"}
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
