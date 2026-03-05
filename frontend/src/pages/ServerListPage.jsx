import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserServers, startServer, stopServer } from "../services/api";
import CreateServerModal from "../components/CreateServerModal";
import Run_btn from "../assets/Run_btn.svg";
import Stop_btn from "../assets/Stop_btn.svg";
import Restart_btn from "../assets/Restart_btn.svg";
import Server_icon from "../assets/Server_icon.svg";
import "../styles/ServerListPage.css";

// Helper to format uptime from a "YYYY-MM-DD HH:mm:ss" string to DD:HH:MM:SS
const formatUptime = (startedAtStr) => {
  if (!startedAtStr) return "00 : 00 : 00 : 00";

  // Crafty returns "2026-03-05 17:42:28" which is in UTC.
  // Replace space with T and append Z to ensure it parses as UTC, not local time.
  const formattedStr = startedAtStr.replace(" ", "T") + "Z";
  const startedAt = new Date(formattedStr).getTime();
  const now = Date.now();

  const diffMs = now - startedAt;
  if (diffMs < 0) return "00 : 00 : 00 : 00"; // Safeguard if clock is slightly off

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const pad = (num) => String(num).padStart(2, '0');

  return `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
};

export default function ServerListPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now()); // State to trigger re-renders for the timer
  const navigate = useNavigate();

  const loadServers = async () => {
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

  useEffect(() => {
    loadServers();

    // Poll for status updates every 10 seconds
    const interval = setInterval(() => {
      loadServers();
    }, 10000);

    // Fast ticker for the uptime visual counter (every 1 second)
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleStart = async (e, serverId) => {
    e.preventDefault();
    try {
      await startServer(serverId);
      setServers(servers.map(s => s._id === serverId ? { ...s, status: "starting" } : s));
    } catch (err) {
      console.error("Failed to start server", err);
    }
  };

  const handleStop = async (e, serverId) => {
    e.preventDefault();
    try {
      await stopServer(serverId);
      setServers(servers.map(s => s._id === serverId ? { ...s, status: "stopped" } : s));
    } catch (err) {
      console.error("Failed to stop server", err);
    }
  };

  const handleRestart = async (e, serverId) => {
    e.preventDefault();
    try {
      await stopServer(serverId);
      setTimeout(async () => {
        await startServer(serverId);
        setServers(servers.map(s => s._id === serverId ? { ...s, status: "starting" } : s));
      }, 1000);
    } catch (err) {
      console.error("Failed to restart server", err);
    }
  };

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
          <Button className="create-server-btn" onClick={() => setIsModalOpen(true)}>
            <span>Create Server</span>
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
            <Link
              key={server._id}
              to={`/servers/${server._id}`}
              className="server-card-link"
            >
              <div className="server-card">
                <div
                  className={`status-indicator ${server.status === "running" ? "is-running" : "is-stopped"}`}
                ></div>

                <div className="server-main-info">
                  <div className="server-icon-wrapper">
                    <img src={Server_icon} alt="Server" className="server-main-icon-svg" />
                  </div>
                  <div className="server-text-details">
                    <h2>{server.serverName || "Server Name"}</h2>
                    <p className="ip-display">Placeholder.Server.IP</p>
                  </div>
                </div>

                <div className="server-status-center">
                  <div className={`status-label-text ${server.status === "running" ? "online" : ""}`}>
                    {server.status === "running" ? (
                      <>
                        <span className="uptime-numbers">{formatUptime(server.startedAt)}</span>
                        <div className="uptime-labels">
                          <span>Days</span>
                          <span>Hours</span>
                          <span>Minutes</span>
                          <span>Seconds</span>
                        </div>
                      </>
                    ) : (
                      "Server Offline"
                    )}
                  </div>
                </div>

                <div className="server-action-group">
                  <button
                    className={`icon-action-btn ${server.status === "running" ? "active" : ""}`}
                    disabled={server.status === "running"}
                    onClick={(e) => handleStart(e, server._id)}
                    title="Start Server"
                  >
                    <img src={Run_btn} alt="Start" className="action-icon-img" />
                  </button>
                  <button
                    className={`icon-action-btn ${server.status === "stopped" ? "active" : ""}`}
                    disabled={server.status === "stopped"}
                    onClick={(e) => handleStop(e, server._id)}
                    title="Stop Server"
                  >
                    <img src={Stop_btn} alt="Stop" className="action-icon-img" />
                  </button>
                  <button
                    className="icon-action-btn"
                    onClick={(e) => handleRestart(e, server._id)}
                    title="Restart Server"
                  >
                    <img src={Restart_btn} alt="Restart" className="action-icon-img" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <CreateServerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
};
