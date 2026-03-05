import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import harddriveIcon from "../assets/icon-harddrive.png";
import groupIcon from "../assets/icon-group.png";
import "../styles/ServerListPage.css"; // Updated CSS import

const ServerListPage = () => {
  // Mock data reflecting the short-term rental model
  const [servers, setServers] = useState([
    {
      id: 1,
      name: "Tropa SMP",
      plan: "1-Week Barkada Pass",
      status: "Online",
      ip: "tropa-smp.auto.playit.gg",
      players: "5/10",
      expires: "2026-03-12",
    },
    {
      id: 2,
      name: "Weekend Build",
      plan: "3-Day Quick Run",
      status: "Offline",
      ip: "weekend-build.auto.playit.gg",
      players: "0/10",
      expires: "2026-03-08",
    },
  ]);

  return (
    <div className="server-list-container">
      <Navbar />

      <main className="server-list-content">
        <header className="server-list-header">
          <h1>My Active Servers</h1>
          <Button className="primary-btn">Rent New Server</Button>
        </header>

        <div className="server-grid">
          {servers.map((server) => (
            <div key={server.id} className="server-card">
              <div className="server-card-header">
                <h2>{server.name}</h2>
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
                  {server.plan}
                </p>
                <p>
                  <img
                    src={groupIcon}
                    alt="Group Icon"
                    className="inline-icon"
                  />
                  {server.players} Players
                </p>
                <div className="ip-container">
                  <strong>IP:</strong> <code>{server.ip}</code>
                </div>
                <p className="expiry-text">Expires: {server.expires}</p>
              </div>

              <div className="server-actions">
                <Button className="secondary-btn">Manage</Button>
                <Button
                  className={
                    server.status === "Online" ? "danger-btn" : "success-btn"
                  }
                >
                  {server.status === "Online" ? "Stop Server" : "Start Server"}
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
