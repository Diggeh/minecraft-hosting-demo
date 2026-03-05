import React, { useState, useEffect, useRef } from "react";
import { listServerFiles, getFileContent, saveFileContent, deleteServerFile, uploadServerFile } from "../services/api";
import "../styles/ServerFileBrowser.css";

// Helper to format file sizes
const formatSize = (bytes) => {
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to get file extension for icon rendering
const getFileIcon = (name, isDirectory) => {
    if (isDirectory) return "📁";
    const ext = name.split(".").pop().toLowerCase();
    const textExts = ["txt", "log", "md", "yml", "yaml", "json", "properties", "cfg", "conf", "ini", "toml", "xml"];
    if (textExts.includes(ext)) return "📄";
    if (["jar", "zip", "gz", "tar"].includes(ext)) return "📦";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
    return "📃";
};

const isTextFile = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    return ["txt", "log", "md", "yml", "yaml", "json", "properties", "cfg", "conf", "ini", "toml", "xml", "sh", "bat"].includes(ext);
};

export default function ServerFileBrowser({ serverId }) {
    const [currentPath, setCurrentPath] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openFile, setOpenFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [editorLoading, setEditorLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Selected item for deletion
    const [selected, setSelected] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const uploadRef = useRef(null);

    const loadFiles = async (path) => {
        setLoading(true);
        setError(null);
        setSelected(null);
        try {
            const data = await listServerFiles(serverId, path || undefined);
            setItems(data.items);
            setCurrentPath(data.currentPath || "");
        } catch (err) {
            setError("Failed to load files: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles("");
    }, [serverId]);

    const breadcrumbs = ["Root", ...currentPath.split("/").filter(Boolean)];

    const navigateTo = (depth) => {
        if (depth === 0) {
            loadFiles("");
        } else {
            const parts = currentPath.split("/").filter(Boolean);
            const newPath = parts.slice(0, depth).join("/");
            loadFiles(newPath);
        }
        setOpenFile(null);
    };

    const handleItemClick = async (item) => {
        setSelected(item.path);
        if (item.isDirectory) {
            loadFiles(item.path);
            setOpenFile(null);
        } else if (isTextFile(item.name)) {
            setOpenFile({ path: item.path, name: item.name });
            setEditorLoading(true);
            setSaveStatus(null);
            try {
                const data = await getFileContent(serverId, item.path);
                setFileContent(data.content);
            } catch (err) {
                setFileContent(`// Error loading file: ${err.response?.data?.message || err.message}`);
            } finally {
                setEditorLoading(false);
            }
        } else {
            setOpenFile(null);
        }
    };

    const handleSave = async () => {
        if (!openFile) return;
        setSaving(true);
        setSaveStatus(null);
        try {
            await saveFileContent(serverId, openFile.path, fileContent);
            setSaveStatus("saved");
        } catch (err) {
            setSaveStatus("error");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveStatus(null), 2500);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setDeleteLoading(true);
        try {
            await deleteServerFile(serverId, selected);
            setSelected(null);
            setConfirmDelete(false);
            if (openFile?.path === selected) setOpenFile(null);
            await loadFiles(currentPath);
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.message || err.message));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadServerFile(serverId, currentPath || ".", file);
            await loadFiles(currentPath);
        } catch (err) {
            alert("Upload failed: " + (err.response?.data?.message || err.message));
        }
        e.target.value = "";
    };

    return (
        <div className="file-browser">
            <div className="file-browser-toolbar">
                <div className="file-breadcrumb">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={i}>
                            <button className="breadcrumb-item" onClick={() => navigateTo(i)}>
                                {crumb}
                            </button>
                            {i < breadcrumbs.length - 1 && <span className="breadcrumb-sep">/</span>}
                        </React.Fragment>
                    ))}
                </div>

                <div className="file-toolbar-actions">
                    <input
                        type="file"
                        ref={uploadRef}
                        style={{ display: "none" }}
                        onChange={handleUpload}
                    />
                    <button className="fb-btn" onClick={() => uploadRef.current?.click()} title="Upload File">
                        ⬆ Upload
                    </button>
                    {selected && (
                        <button
                            className="fb-btn fb-btn-danger"
                            onClick={() => setConfirmDelete(true)}
                            title="Delete selected"
                        >
                            🗑 Delete
                        </button>
                    )}
                    <button className="fb-btn" onClick={() => loadFiles(currentPath)} title="Refresh">
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {confirmDelete && (
                <div className="fb-confirm-overlay" onClick={() => setConfirmDelete(false)}>
                    <div className="fb-confirm-box" onClick={(e) => e.stopPropagation()}>
                        <p>Delete <strong>{selected?.split("/").pop()}</strong>?</p>
                        <p className="fb-confirm-sub">This action cannot be undone.</p>
                        <div className="fb-confirm-actions">
                            <button className="fb-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                            <button className="fb-btn fb-btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`file-browser-main ${openFile ? "has-editor" : ""}`}>
                <div className="file-list-panel">
                    {loading && <div className="fb-status">Loading files...</div>}
                    {error && <div className="fb-status fb-error">{error}</div>}
                    {!loading && !error && items.length === 0 && (
                        <div className="fb-status">This folder is empty.</div>
                    )}
                    {!loading && items.map((item) => (
                        <div
                            key={item.path}
                            className={`file-item ${selected === item.path ? "selected" : ""}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <span className="file-icon">{getFileIcon(item.name, item.isDirectory)}</span>
                            <span className="file-name">{item.name}</span>
                            <span className="file-size">{item.isDirectory ? "" : formatSize(item.size)}</span>
                        </div>
                    ))}
                </div>

                {openFile && (
                    <div className="file-editor-panel">
                        <div className="editor-header">
                            <span className="editor-filename">{openFile.name}</span>
                            <button
                                className={`fb-btn save-btn ${saveStatus === "saved" ? "saved" : saveStatus === "error" ? "error" : ""}`}
                                onClick={handleSave}
                                disabled={saving || editorLoading}
                            >
                                {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "error" ? "✗ Error" : "Save"}
                            </button>
                            <button className="fb-btn editor-close" onClick={() => setOpenFile(null)}>✕</button>
                        </div>
                        {editorLoading ? (
                            <div className="fb-status">Loading file content...</div>
                        ) : (
                            <textarea
                                className="file-editor-textarea"
                                value={fileContent}
                                onChange={(e) => setFileContent(e.target.value)}
                                spellCheck={false}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
