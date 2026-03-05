import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { getUserServers } from "../services/api";
import { Play, Square, RotateCcw, Plus } from "lucide-react";
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
          <Button className="create-server-btn">
            <span>Create Server</span>
            <Plus size={24} />
          </Button>
        </header>

        {loading && <p className="status-message">Loading your servers...</p>}
        {error && <p className="status-message error">{error}</p>}
        {!loading && servers.length === 0 && (
          <p className="status-message">
            You don't have any active servers yet!
          </p>
        )}

        <div className="server-list">
          {servers.map((server) => (
            <div key={server._id} className="server-card">
              <div
                className={`status-indicator ${server.status === "running" ? "is-running" : "is-stopped"}`}
              ></div>

              <div className="server-main-info">
                <div className="server-icon-wrapper">
                  <div className="server-inner-icon">
                    <div className="icon-screen"></div>
                    <div className="icon-dots"></div>
                  </div>
                </div>
                <div className="server-text-details">
                  <h2>{server.serverName || "Server Name"}</h2>
                  <p className="ip-display">Placeholder.Server.IP</p>
                </div>
              </div>

              <div className="server-action-group">
                <button className="icon-action-btn">
                  <Play size={18} fill="currentColor" />
                </button>
                <button className="icon-action-btn">
                  <Square size={18} fill="currentColor" />
                </button>
                <button className="icon-action-btn">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ServerListPage;
