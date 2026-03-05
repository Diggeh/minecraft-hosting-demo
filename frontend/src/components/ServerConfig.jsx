import React, { useState, useEffect } from "react";
import { getServerConfig, saveServerConfig } from "../services/api";
import "../styles/ServerConfig.css";

const Toggle = ({ checked, onChange, label, description }) => (
    <div className="config-toggle-row">
        <div className="config-toggle-label-wrap">
            <span className="config-toggle-label">{label}</span>
            {description && <span className="config-toggle-desc">{description}</span>}
        </div>
        <button
            className={`config-toggle ${checked ? "on" : "off"}`}
            onClick={() => onChange(!checked)}
            type="button"
            aria-pressed={checked}
        >
            <span className="toggle-thumb" />
        </button>
    </div>
);

export default function ServerConfig({ serverId }) {
    const [config, setConfig] = useState(null);
    const [original, setOriginal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error" | null
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getServerConfig(serverId);
                setConfig(data);
                setOriginal(data);
            } catch (err) {
                setErrorMsg("Failed to load configuration.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [serverId]);

    const handleChange = (key, value) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            // Only send fields that changed
            const diff = {};
            for (const key of Object.keys(config)) {
                if (config[key] !== original[key]) diff[key] = config[key];
            }
            if (Object.keys(diff).length === 0) {
                setSaveStatus("saved"); // Nothing changed, still show "Saved"
                setSaving(false);
                setTimeout(() => setSaveStatus(null), 2000);
                return;
            }
            await saveServerConfig(serverId, diff);
            setOriginal(config); // Update baseline
            setSaveStatus("saved");
        } catch (err) {
            setSaveStatus("error");
            setErrorMsg(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleCancel = () => {
        setConfig(original);
    };

    const isDirty = config && original && JSON.stringify(config) !== JSON.stringify(original);

    if (loading) return <div className="config-status">Loading configuration...</div>;
    if (!config) return <div className="config-status error">{errorMsg}</div>;

    return (
        <div className="server-config">
            {/* Left column: form fields */}
            <div className="config-form">
                <h2 className="config-section-title">General</h2>

                <div className="config-field">
                    <label className="config-label">
                        Server Name
                        <span className="config-desc">The display name for your server</span>
                    </label>
                    <input
                        className="config-input"
                        type="text"
                        value={config.server_name}
                        onChange={(e) => handleChange("server_name", e.target.value)}
                    />
                </div>

                <div className="config-field">
                    <label className="config-label">
                        Server Port
                        <span className="config-desc">The port your server listens on (read-only)</span>
                    </label>
                    <input
                        className="config-input"
                        type="number"
                        value={config.server_port}
                        disabled
                    />
                </div>

                <div className="config-field">
                    <label className="config-label">
                        Server Software
                        <span className="config-desc">The executable your server runs on</span>
                    </label>
                    <input
                        className="config-input"
                        type="text"
                        value={config.executable}
                        disabled
                    />
                </div>

                <div className="config-divider" />
                <h2 className="config-section-title">Startup & Shutdown</h2>

                <div className="config-field config-field-inline">
                    <label className="config-label">
                        Auto Start Delay
                        <span className="config-desc">Seconds to wait before auto-starting</span>
                    </label>
                    <input
                        className="config-input config-input-short"
                        type="number"
                        min={0}
                        value={config.auto_start_delay}
                        onChange={(e) => handleChange("auto_start_delay", Number(e.target.value))}
                    />
                </div>

                <div className="config-field config-field-inline">
                    <label className="config-label">
                        Shutdown Timeout
                        <span className="config-desc">Seconds to wait before force-killing the server process</span>
                    </label>
                    <input
                        className="config-input config-input-short"
                        type="number"
                        min={0}
                        value={config.shutdown_timeout}
                        onChange={(e) => handleChange("shutdown_timeout", Number(e.target.value))}
                    />
                </div>

                <div className="config-divider" />
                <h2 className="config-section-title">Logging</h2>

                <div className="config-field config-field-inline">
                    <label className="config-label">
                        Remove Old Logs After
                        <span className="config-desc">Days to retain log files (0 = never delete)</span>
                    </label>
                    <input
                        className="config-input config-input-short"
                        type="number"
                        min={0}
                        value={config.logs_delete_after}
                        onChange={(e) => handleChange("logs_delete_after", Number(e.target.value))}
                    />
                </div>

                <div className="config-divider" />
                <h2 className="config-section-title">Toggles</h2>

                <Toggle
                    checked={config.auto_start}
                    onChange={(v) => handleChange("auto_start", v)}
                    label="Auto Start"
                    description="Automatically start this server when BlockBayan starts"
                />
                <Toggle
                    checked={config.crash_detection}
                    onChange={(v) => handleChange("crash_detection", v)}
                    label="Crash Detection"
                    description="Automatically restart if an unexpected crash is detected"
                />
                <Toggle
                    checked={config.count_players}
                    onChange={(v) => handleChange("count_players", v)}
                    label="Include in Player Count"
                    description="Count this server's players in the total player statistics"
                />
                <Toggle
                    checked={config.show_status}
                    onChange={(v) => handleChange("show_status", v)}
                    label="Show on Public Status Page"
                    description="Display this server on the public-facing status dashboard"
                />

                {/* Save / Cancel */}
                <div className="config-actions">
                    <button
                        className={`config-save-btn ${saveStatus === "saved" ? "saved" : saveStatus === "error" ? "err" : ""}`}
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                    >
                        {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "error" ? "✗ Error" : "Save Changes"}
                    </button>
                    {isDirty && (
                        <button className="config-cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                    {saveStatus === "error" && <span className="config-error-msg">{errorMsg}</span>}
                </div>
            </div>

            {/* Right column: info panel */}
            <aside className="config-sidebar">
                <div className="config-info-box">
                    <p className="config-info-title">Server Configuration</p>
                    <p className="config-info-body">
                        Changes saved here are applied directly to your Minecraft server.
                        Some settings (like port) require a server restart to take effect.
                    </p>
                </div>
                <div className="config-info-box config-info-warn">
                    <p className="config-info-title">⚠ Heads Up</p>
                    <p className="config-info-body">
                        Enabling <strong>Auto Start</strong> means BlockBayan will start your server automatically on every system boot — this may consume resources when idle.
                    </p>
                </div>
            </aside>
        </div>
    );
}
