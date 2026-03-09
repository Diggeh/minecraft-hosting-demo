import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  getServerById,
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  getServerLogs,
  sendServerCommand,
} from "../services/api";
import ServerFileBrowser from "../components/ServerFileBrowser";
import ServerConfig from "../components/ServerConfig";
import "../styles/ServerDashboardPage.css";
import runIcon from "../assets/Run_btn.svg";
import stopIcon from "../assets/Stop_btn.svg";
import consoleIcon from "../assets/Console_icon.svg";
import filesIcon from "../assets/Files_icon.svg";
import settingsIcon from "../assets/Settings_icon.svg";
import serverIconLarge from "../assets/Server_icon.svg";
import restartIcon from "../assets/icon-restart-blue.svg";

const ServerDashboardPage = () => {
  const { id } = useParams();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState("");
  const [liveStats, setLiveStats] = useState(null);
  const consoleEndRef = React.useRef(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMemory = (bytes) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  useEffect(() => {
    if (activeTab === "console") {
      scrollToBottom();
    }
  }, [logs, activeTab]);

  // Clear console logs whenever the server stops
  useEffect(() => {
    if (server?.status === "stopped") {
      setLogs([]);
    }
  }, [server?.status]);

  const handleCommandSubmit = async (e) => {
    if (e.key === "Enter" && command.trim()) {
      const cmd = command.trim();
      setCommand("");
      setLogs((prev) => [...prev, `> ${cmd}`]);

      try {
        await sendServerCommand(id, cmd);
      } catch (err) {
        setLogs((prev) => [
          ...prev,
          `[System Error]: Failed to send command: ${err.message}`,
        ]);
      }
    }
  };

  // Fetch server details once on mount
  useEffect(() => {
    const fetchServer = async () => {
      try {
        const data = await getServerById(id);
        setServer(data);
      } catch (err) {
        setError("Failed to load server details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServer();
  }, [id]);

  // Fetch status and stats when tab changes to dashboard or on mount
  useEffect(() => {
    if (activeTab !== "dashboard") return;
    const fetchStatus = async () => {
      try {
        const data = await getServerStatus(id);
        // Normalize status safely for various API shapes
        const normalize = (d) => {
          // Prefer explicit server_status/status strings, then boolean 'running'
          const raw =
            d?.server_status ??
            d?.status ??
            (d?.running !== undefined ? d.running : "stopped");
          if (typeof raw === "boolean") return raw ? "running" : "stopped";
          if (typeof raw === "number") return raw ? "running" : "stopped";
          const s = String(raw).toLowerCase();
          if (s === "online" || s === "running" || s === "true" || s === "1")
            return "running";
          return "stopped";
        };

        const liveStatus = normalize(data);

        setLiveStats(data);
        console.debug("Status poll", id, { data, liveStatus });
        setServer((prev) => {
          const normalizedStatus =
            liveStatus === "online" ? "running" : liveStatus;
          if (!prev) {
            // If server details haven't loaded yet, create a minimal server
            // object so the UI reflects the current status immediately.
            return { _id: id, status: normalizedStatus };
          }
          if (prev.status !== normalizedStatus) {
            console.log(
              `📡 Dashboard Sync: ${prev.status} -> ${normalizedStatus}`,
            );
            return { ...prev, status: normalizedStatus };
          }
          return prev;
        });
      } catch (err) {
        console.warn("Status fetch failed", err);
      }
    };
    fetchStatus();
  }, [id, activeTab]);

  // Poll server status periodically while on the dashboard tab
  useEffect(() => {
    if (activeTab !== "dashboard") return;
    const interval = setInterval(() => {
      fetchStatusAndStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  // Fetch logs when tab changes to console or on mount
  useEffect(() => {
    if (activeTab !== "console") return;
    const fetchLogs = async () => {
      if (server?.status === "stopped") return;
      try {
        const data = await getServerLogs(id);
        setLogs(data || []);
      } catch (err) {
        console.warn("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, [id, activeTab, server?.status]);

  const fetchStatusAndStats = async () => {
    try {
      const data = await getServerStatus(id);
      const normalize = (d) => {
        const raw =
          d?.server_status ??
          d?.status ??
          (d?.running !== undefined ? d.running : "stopped");
        if (typeof raw === "boolean") return raw ? "running" : "stopped";
        if (typeof raw === "number") return raw ? "running" : "stopped";
        const s = String(raw).toLowerCase();
        if (s === "online" || s === "running" || s === "true" || s === "1")
          return "running";
        return "stopped";
      };
      const liveStatus = normalize(data);
      setLiveStats(data);
      console.debug("Status poll (periodic)", id, { data, liveStatus });
      setServer((prev) => {
        if (!prev) {
          return { _id: id, status: liveStatus };
        }
        if (prev.status !== liveStatus) {
          return { ...prev, status: liveStatus };
        }
        return prev;
      });
    } catch (err) {
      console.warn("Status fetch failed", err);
    }
  };

  const toggleServer = async () => {
    if (!server) return;
    try {
      if (server.status === "running") {
        await stopServer(server._id);
        setServer({ ...server, status: "stopped" });
      } else {
        await startServer(server._id);
        setServer({ ...server, status: "starting" });
      }
      // Fetch latest status after action
      await fetchStatusAndStats();
    } catch (err) {
      console.error("Failed to toggle server status", err);
    }
  };

  const handleStop = async () => {
    if (!server || server.status !== "running") return;
    try {
      await stopServer(server._id);
      setServer({ ...server, status: "stopped" });
      await fetchStatusAndStats();
    } catch (err) {
      console.error("Stop failed", err);
    }
  };

  const handleRestart = async () => {
    if (!server) return;
    try {
      await restartServer(server._id);
      setServer({ ...server, status: "starting" });
      await fetchStatusAndStats();
    } catch (err) {
      console.error("Restart failed", err);
    }
  };

  if (loading)
    return <div className="dashboard-status">Loading dashboard...</div>;
  if (error) return <div className="dashboard-status error">{error}</div>;
  if (!server) return <div className="dashboard-status">Server not found.</div>;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <img src={serverIconLarge} alt="Dashboard" className="tab-icon-img" />
      ),
    },
    {
      id: "console",
      label: "Console",
      icon: <img src={consoleIcon} alt="Console" className="tab-icon-img" />,
    },
    {
      id: "files",
      label: "Files",
      icon: <img src={filesIcon} alt="Files" className="tab-icon-img" />,
    },
    {
      id: "configuration",
      label: "Configuration",
      icon: <img src={settingsIcon} alt="Settings" className="tab-icon-img" />,
    },
  ];

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>{server.serverName}</title>
      </Helmet>
      <main className="dashboard-content">
        <Link to="/servers" className="back-link">
          Back to Servers
        </Link>

        <div className="dashboard-card">
          <header className="dashboard-header">
            <div className="server-info-section">
              <div className="server-icon-large">
                <img
                  src={serverIconLarge}
                  alt="Server"
                  className="server-icon-large-svg"
                />
              </div>
              <div className="server-text-info">
                <h1>{server.serverName || "Server Name"}</h1>
                <p className="server-ip">Placeholder.Server.IP</p>
              </div>
            </div>

            <div className="server-controls">
              {server.status === "running" ? (
                <button
                  className="ctrl-btn stop-btn"
                  onClick={toggleServer}
                  disabled={server.status === "stopping"}
                  title="Stop"
                >
                  <img
                    src={stopIcon}
                    alt="Stop"
                    className="action-btn-icon-img stop-btn-icon-img"
                  />
                  Stop
                </button>
              ) : (
                <button
                  className={`start-btn ${["starting", "stopping"].includes(server.status) ? "disabled" : ""}`}
                  onClick={toggleServer}
                  disabled={["starting", "stopping"].includes(server.status)}
                >
                  <div className="start-icon-wrapper">
                    <img
                      src={runIcon}
                      alt="Start"
                      className="action-btn-icon-img"
                    />
                  </div>
                  <span>
                    {server.status === "starting"
                      ? "Starting..."
                      : server.status === "stopping"
                        ? "Stopping..."
                        : "Start"}
                  </span>
                </button>
              )}
              {server.status === "running" && (
                <button
                  className="ctrl-btn restart-btn"
                  onClick={handleRestart}
                  title="Restart"
                >
                  <img src={restartIcon} />
                  Restart
                </button>
              )}
            </div>
          </header>

          <nav className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div
            className={`tab-pane ${activeTab === "files" ? "tab-files" : activeTab === "configuration" ? "tab-config" : ""}`}
          >
            {activeTab === "console" ? (
              <div className="console-container">
                <div className="console-logs">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="log-line"
                        dangerouslySetInnerHTML={{ __html: log }}
                      />
                    ))
                  ) : (
                    <div className="log-placeholder">
                      {server?.status === "stopped"
                        ? "Server is offline. Start the server to see console logs."
                        : "Fetching logs..."}
                    </div>
                  )}
                  <div ref={consoleEndRef} />
                </div>
                <div className="console-input-wrapper">
                  <span className="console-prompt">&gt;</span>
                  <input
                    type="text"
                    placeholder="Enter command..."
                    className="console-input"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleCommandSubmit}
                  />
                </div>
              </div>
            ) : activeTab === "files" ? (
              <ServerFileBrowser serverId={id} />
            ) : activeTab === "configuration" ? (
              <ServerConfig serverId={id} />
            ) : (
              <div className="stats-grid">
                <div className="stats-column">
                  <div className="stat-item">
                    <span className="stat-label">Server Status:</span>
                    <span
                      className={`stat-value ${server.status === "running" ? "online" : "offline"}`}
                    >
                      {server.status === "running"
                        ? "Online"
                        : server.status.charAt(0).toUpperCase() +
                          server.status.slice(1)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Server Started:</span>
                    <span className="stat-value">
                      {liveStats?.started &&
                      liveStats.started !== "False" &&
                      !isNaN(new Date(liveStats.started).getTime())
                        ? new Date(liveStats.started).toLocaleString()
                        : "Offline"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Server Time Zone:</span>
                    <span className="stat-value">
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </span>
                  </div>
                </div>

                <div className="stats-column">
                  <div className="stat-item">
                    <span className="stat-label">CPU Usage:</span>
                    <span className="stat-value">
                      {liveStats?.cpu?.toFixed(1) || "0.0"}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Memory Usage:</span>
                    <span className="stat-value">
                      {formatMemory(liveStats?.mem || 0)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Players:</span>
                    <span className="stat-value">
                      {liveStats?.online || 0} / {liveStats?.max || 0}
                    </span>
                  </div>
                </div>

                <div className="stats-column">
                  <div className="stat-item">
                    <span className="stat-label">Version:</span>
                    <span className="stat-value">
                      {liveStats?.version && liveStats.version !== "False"
                        ? liveStats.version
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Description:</span>
                    <span className="stat-value">
                      {liveStats?.desc && liveStats.desc !== "False"
                        ? liveStats.desc
                        : "No description"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Server Type:</span>
                    <span className="stat-value highlight">
                      {liveStats?.server_id?.type || "minecraft-java"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServerDashboardPage;
