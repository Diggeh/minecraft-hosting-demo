import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { getUserServers } from "../services/api";
import "../styles/ServerListPage.css";

const ServerListPage = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <header className="server-list-header">
          <div className="header-titles">
            <h1>Your Servers</h1>
            <p className="subtitle">
              Manage all your game servers in one place
            </p>
          </div>
          <Button className="primary-btn create-btn">Create Server +</Button>
        </header>

        {loading && <p className="status-message">Loading your servers...</p>}
        {error && <p className="status-message error">{error}</p>}
        {!loading && servers.length === 0 && (
          <p className="status-message">
            You don't have any active servers yet!
          </p>
        )}

        {/* The Long Rectangle List */}
        <div className="server-list">
          {servers.map((server) => (
            <div key={server._id} className="server-card">
              {/* THE SLIM ROUNDED LINE ON THE LEFT */}
              <div
                className={`status-line ${server.status === "running" ? "line-green" : "line-red"}`}
              ></div>

              {/* LEFT SIDE: Info */}
              <div className="server-info">
                <h2>{server.serverName}</h2>
                <p className="ip-text">Placeholder Server.IP</p>
              </div>

              {/* RIGHT SIDE: 3 Buttons */}
              <div className="server-actions">
                <Button className="secondary-btn">Manage</Button>
                <Button
                  className={
                    server.status === "running" ? "danger-btn" : "success-btn"
                  }
                >
                  {server.status === "running" ? "Stop" : "Start"}
                </Button>
                <button className="options-menu-btn">•••</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ServerListPage;
