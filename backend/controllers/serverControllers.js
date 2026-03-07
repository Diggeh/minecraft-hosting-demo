const axios = require("axios");
const fs = require("fs").promises; // Node's built-in file system module
const path = require("path");
const Server = require("../models/Server");

// 🔧 Helper setup for talking to Crafty
// This prevents us from having to type the headers and SSL bypass on every single request
const craftyApi = axios.create({
  baseURL: process.env.CRAFTY_API_URL,
  headers: { Authorization: `Bearer ${process.env.CRAFTY_API_TOKEN}` },
  httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }), // Bypasses local SSL warnings
});

const fetchCraftyStatsByCraftyId = async (req, res) => {
  try {
    const craftyResponse = await craftyApi.get(
      `/servers/${req.params.craftyId}/stats`,
    );
    res.json(craftyResponse.data.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createNewServer = async (req, res) => {
  try {
    const { serverName } = req.body;

    // Generate a random port between 25565 and 26000 for this new server
    const randomPort = Math.floor(Math.random() * (26000 - 25565 + 1)) + 25565;

    // 1. Tell Crafty to build the server using the strict Crafty 4 Schema
    const craftyResponse = await craftyApi.post("/servers", {
      name: serverName,
      monitoring_type: "minecraft_java",
      minecraft_java_monitoring_data: {
        host: "127.0.0.1",
        port: randomPort,
      },
      create_type: "minecraft_java",
      minecraft_java_create_data: {
        create_type: "download_jar",
        download_jar_create_data: {
          category: "mc_java_servers",
          type: "paper",
          version: "1.20.4",
          mem_min: 1, // 1GB minimum
          mem_max: 2, // 2GB maximum
          server_properties_port: randomPort,
        },
      },
    });

    // Let's log the response to the terminal just to see exactly what Crafty hands back!
    console.log("Crafty Success Response:", craftyResponse.data);

    // Grab the exact ID from the Crafty 4 response
    const newServerId = craftyResponse.data.data?.new_server_id;

    // 2. Save the bridge data into our MongoDB
    const myDbServer = await Server.create({
      owner: req.user.id, // Link this server to the logged-in user's ID
      crafty_server_id: newServerId || "TEMP_ID", // Failsafe in case the ID location changed
      serverName: serverName,
      port: randomPort,
      status: "stopped",
    });

    res
      .status(201)
      .json({ message: "Server created successfully!", server: myDbServer });
  } catch (error) {
    console.error("Crafty API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create server on Crafty" });
  }
};

const startExistingServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server)
      return res.status(404).json({ message: "Server not found in database" });

    console.log(
      `🚀 Trying to start Crafty Server ID: ${server.crafty_server_id}`,
    );

    // --- AUTO-EULA INJECTION ---
    try {
      // Build the exact path to this server's folder on your hard drive
      const serverFolderPath = path.join(
        process.env.CRAFTY_SERVERS_DIR,
        server.crafty_server_id,
      );
      const eulaPath = path.join(serverFolderPath, "eula.txt");

      // Write the file (eula=true) before Minecraft can crash!
      await fs.writeFile(eulaPath, "eula=true");
      console.log("✅ Auto-signed EULA for server!");
    } catch (fsError) {
      console.error(
        "⚠️ Could not write EULA file. Check your CRAFTY_SERVERS_DIR path:",
        fsError.message,
      );
    }
    // ---------------------------

    // Send the start command to Crafty
    await craftyApi.post(
      `/servers/${server.crafty_server_id}/action/start_server`,
    );

    server.status = "starting";
    await server.save();

    res.status(200).json({ message: "Server start command sent!" });
  } catch (error) {
    console.error("Crafty Start Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to start server on Crafty" });
  }
};

const stopExistingServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server)
      return res.status(404).json({ message: "Server not found in database" });

    // Send the stop command to Crafty
    await craftyApi.post(
      `/servers/${server.crafty_server_id}/action/stop_server`,
    );

    server.status = "stopped";
    await server.save();

    res.status(200).json({ message: "Server stop command sent!" });
  } catch (error) {
    console.error("Crafty Stop Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to stop server" });
  }
};

const viewAllServer = async (req, res) => {
  try {
    // 1. First, find servers owned by the logged-in user
    console.log(`🔍 Fetching servers for user: ${req.user.id}`);
    let servers = await Server.find({ owner: req.user.id });
    console.log(`Found ${servers.length} servers for user ${req.user.id}`);

    // 2. Fallback: If the user has no servers, show ALL servers (demo fallback)
    if (servers.length === 0) {
      console.log(
        "ℹ️ No servers found for user, showing all servers as fallback...",
      );
      servers = await Server.find({});
      console.log(`Found ${servers.length} total servers.`);
    }

    // 3. SYNC STATUS for all found servers in parallel for the list page
    const serversWithUptime = await Promise.all(
      servers.map(async (serverDoc) => {
        const server = serverDoc.toObject(); // Convert mongoose doc to plain object so we can add temp fields
        try {
          if (
            server.crafty_server_id &&
            server.crafty_server_id !== "TEMP_ID"
          ) {
            const craftyResponse = await craftyApi.get(
              `/servers/${server.crafty_server_id}/stats`,
            );
            const craftyData = craftyResponse.data.data;
            require("fs").writeFileSync(
              "crafty_stats_list.json",
              JSON.stringify(craftyData, null, 2),
            );

            let liveStatus = "stopped";
            if (craftyData.server_status) {
              liveStatus = craftyData.server_status.toLowerCase();
            } else if (craftyData.status) {
              liveStatus = craftyData.status.toLowerCase();
            } else if (craftyData.running === true) {
              liveStatus = "running";
            }

            if (liveStatus === "online") liveStatus = "running";
            if (liveStatus === "offline") liveStatus = "stopped";

            // Attach the start time for the frontend timer
            if (liveStatus === "running" && craftyData.started) {
              server.startedAt = craftyData.started; // e.g., "2026-03-05 17:42:28"
            }

            if (serverDoc.status !== liveStatus) {
              serverDoc.status = liveStatus;
              server.status = liveStatus; // update the plain object too
              await serverDoc.save();
            }
          }
        } catch (err) {
          console.warn(`⚠️ Failed to sync status for ${server.serverName}`);
          // If Crafty returns a 404 or 400 (which Crafty uses for invalid/missing IDs),
          // the server was deleted from Crafty. Clean up our database to remove the "zombie" server.
          if (
            err.response &&
            (err.response.status === 404 || err.response.status === 400)
          ) {
            console.log(
              `🗑️ Auto-cleaning deleted remote server from DB: ${server.serverName}`,
            );
            await Server.findByIdAndDelete(serverDoc._id);
            return null; // Don't return this server in the final list
          }
        }
        return server;
      }),
    );

    // Filter out any servers that were just deleted
    const validServers = serversWithUptime.filter((s) => s !== null);

    res.status(200).json(validServers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch servers from database" });
  }
};

const viewSingleServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Permissive for demo: Allow viewing any server found by ID
    const serverData = server.toObject();

    // SYNC STATUS: Fetch live status from Crafty to ensure DB is up to date
    try {
      if (server.crafty_server_id && server.crafty_server_id !== "TEMP_ID") {
        const craftyResponse = await craftyApi.get(
          `/servers/${server.crafty_server_id}/stats`,
        );
        const craftyData = craftyResponse.data.data;
        require("fs").writeFileSync(
          "crafty_stats.json",
          JSON.stringify(craftyData, null, 2),
        );

        let liveStatus = "stopped";
        if (craftyData.server_status) {
          liveStatus = craftyData.server_status.toLowerCase();
        } else if (craftyData.status) {
          liveStatus = craftyData.status.toLowerCase();
        } else if (craftyData.running === true) {
          liveStatus = "running";
        }

        // Map Crafty states to our simplified states
        if (liveStatus === "online") liveStatus = "running";
        if (liveStatus === "offline") liveStatus = "stopped";

        // Attach the start time for the frontend timer
        if (liveStatus === "running" && craftyData.started) {
          serverData.startedAt = craftyData.started;
        }

        if (server.status !== liveStatus) {
          console.log(
            `🔄 On-demand Sync for ${server.serverName}: ${server.status} -> ${liveStatus}`,
          );
          server.status = liveStatus;
          serverData.status = liveStatus;
          await server.save();
        }
      }
    } catch (err) {
      console.warn(
        `⚠️ Failed to sync status during fetch for ${server.serverName}`,
      );
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 400)
      ) {
        console.log(
          `🗑️ Auto-cleaning deleted remote server from DB: ${server.serverName}`,
        );
        await Server.findByIdAndDelete(server._id);
        return res
          .status(404)
          .json({ message: "Server was deleted from the remote host" });
      }
    }

    res.status(200).json(serverData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch server details" });
  }
};

const deleteServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server)
      return res.status(404).json({ message: "Server not found in database" });

    console.log(`🗑️ Deleting Crafty Server ID: ${server.crafty_server_id}`);

    // --- GRACEFUL CRAFTY DELETION ---
    try {
      // If it's our broken TEMP_ID, don't even bother asking Crafty
      if (server.crafty_server_id === "TEMP_ID") {
        console.log(
          "⚠️ Skipping Crafty deletion for TEMP_ID. Cleaning database...",
        );
      } else {
        // Send the delete command to Crafty
        await craftyApi.delete(`/servers/${server.crafty_server_id}`);
        console.log("✅ Server deleted from Crafty.");
      }
    } catch (craftyError) {
      // If Crafty fails (e.g., server already deleted manually), log it but DON'T crash
      console.warn(
        "⚠️ Crafty couldn't delete the server. Moving on to database cleanup...",
      );
    }
    // --------------------------------

    // Always remove the bridging data from our MongoDB, no matter what!
    await Server.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Server completely wiped from database!" });
  } catch (error) {
    console.error("Database Delete Error:", error.message);
    res.status(500).json({ message: "Failed to process deletion" });
  }
};

const getLiveServerStatus = async (req, res) => {
  try {
    // 1. Find the server in your MongoDB
    const server = await Server.findById(req.params.id);
    if (!server)
      return res.status(404).json({ message: "Server not found in database" });

    // 2. Fetch the live stats from Crafty's API
    console.log(
      `📡 Fetching live status from Crafty for: ${server.serverName} (${server.crafty_server_id})`,
    );
    try {
      const craftyResponse = await craftyApi.get(
        `/servers/${server.crafty_server_id}/stats`,
      );

      const craftyData = craftyResponse.data.data;

      let liveStatus = "stopped";
      if (craftyData.running === true && craftyResponse.status) {
        liveStatus = "running";
      } else {
        liveStatus = "stopped";
      }

      console.log(`Live status: ${liveStatus}`);
      console.log(
        `📦 Crafty Data for ${server.serverName}:`,
        JSON.stringify(craftyData, null, 1),
      );
      console.log(
        `🔍 Live Status parsed: "${liveStatus}" (Current DB Status: "${server.status}")`,
      );

      // 3. Sync the live status back to our MongoDB if it's different
      if (server.status !== liveStatus) {
        console.log(
          `🔄 Syncing status for ${server.serverName}: ${server.status} -> ${liveStatus}`,
        );
        server.status = liveStatus;
        await server.save();
      }

      // 4. Send the entire stats payload back to the client
      return res.status(200).json(craftyData);
    } catch (error) {
      // Crafty is unreachable, update status to 'stopped' if not already
      console.error(
        "Crafty Stats Error:",
        error.response?.data || error.message,
      );
      if (server.status !== "stopped") {
        server.status = "stopped";
        await server.save();
      }
      return res.status(200).json({
        running: false,
        status: "stopped",
        message: "Crafty unreachable, status set to stopped",
      });
    }
  } catch (error) {
    console.error("Server Status Route Error:", error.message);
    res.status(500).json({ message: "Failed to fetch server status" });
  }
};

const updateServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server)
      return res.status(404).json({ message: "Server not found in DB" });

    const { serverName } = req.body;

    const updatePayload = {};

    if (serverName) {
      updatePayload.server_name = serverName;
    }

    console.log(
      "📤 PATCHING CRAFTY V2:",
      JSON.stringify(updatePayload, null, 2),
    );

    const craftyResponse = await craftyApi.patch(
      `/servers/${server.crafty_server_id}`,
      updatePayload,
    );

    if (serverName) server.serverName = serverName;
    await server.save();

    res.status(200).json({
      message: "Server updated successfully!",
      server,
      craftyResponse: craftyResponse.data,
    });
  } catch (error) {
    console.error("❌ CRAFTY REJECTED:", error.response?.data || error.message);
    res.status(500).json({
      message: "Update failed",
      detail: error.response?.data || error.message,
    });
  }
};

const getServerLogs = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    // Fetch logs from Crafty (using file=false for stdout/active logs)
    const craftyResponse = await craftyApi.get(
      `/servers/${server.crafty_server_id}/logs`,
      {
        params: { file: false, colors: true, html: false },
      },
    );

    res.status(200).json(craftyResponse.data.data);
  } catch (error) {
    console.error("Crafty Logs Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch logs from Crafty" });
  }
};

const sendServerCommand = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const { command } = req.body;
    if (!command)
      return res.status(400).json({ message: "No command provided" });

    // Send command to Crafty via stdin
    await craftyApi.post(`/servers/${server.crafty_server_id}/stdin`, command, {
      headers: { "Content-Type": "text/plain" },
    });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(
      "Crafty Command Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({ message: "Failed to send command to Crafty" });
  }
};

const restartServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    await craftyApi.post(
      `/servers/${server.crafty_server_id}/action/restart_server`,
    );
    server.status = "starting";
    await server.save();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(
      "Crafty Restart Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({ message: "Failed to restart server" });
  }
};

const getServerConfig = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const craftyResponse = await craftyApi.get(
      `/servers/${server.crafty_server_id}/stats`,
    );
    const raw = craftyResponse.data.data?.server_id;

    // Only expose user-friendly fields, never paths or internal IPs
    const config = {
      server_name: raw.server_name,
      server_port: raw.server_port,
      executable: raw.executable,
      auto_start: raw.auto_start,
      auto_start_delay: raw.auto_start_delay,
      crash_detection: raw.crash_detection,
      shutdown_timeout: raw.shutdown_timeout,
      logs_delete_after: raw.logs_delete_after,
      count_players: raw.count_players,
      show_status: raw.show_status,
    };

    res.status(200).json(config);
  } catch (error) {
    console.error("Config Fetch Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch server config" });
  }
};

const updateServerConfig = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    // Build a safe update payload — only allow known config keys
    const allowed = [
      "server_name",
      "auto_start",
      "auto_start_delay",
      "crash_detection",
      "shutdown_timeout",
      "logs_delete_after",
      "count_players",
      "show_status",
    ];

    const updatePayload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updatePayload[key] = req.body[key];
    }

    await craftyApi.patch(`/servers/${server.crafty_server_id}`, updatePayload);

    // If the server name changed, also update our MongoDB
    if (
      updatePayload.server_name &&
      updatePayload.server_name !== server.serverName
    ) {
      server.serverName = updatePayload.server_name;
      await server.save();
    }

    res.status(200).json({ message: "Configuration saved successfully" });
  } catch (error) {
    console.error(
      "Config Update Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      message:
        "Failed to save config: " +
        (error.response?.data?.error || error.message),
    });
  }
};

// Helper: resolve and validate a path inside the server's directory
const resolveServerPath = (craftyServerId, subpath) => {
  const baseDir = path.join(process.env.CRAFTY_SERVERS_DIR, craftyServerId);
  const resolved = path.resolve(baseDir, subpath || ".");
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error("Path traversal detected");
  }
  return { baseDir, resolved };
};

const listServerFiles = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const subpath = req.query.path || ".";
    const { baseDir, resolved } = resolveServerPath(
      server.crafty_server_id,
      subpath,
    );

    const entries = await fs.readdir(resolved, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(resolved, entry.name);
        const stat = await fs.stat(fullPath).catch(() => null);
        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          size: stat ? stat.size : 0,
          modified: stat ? stat.mtime : null,
          path: path.relative(baseDir, fullPath).replace(/\\/g, "/"),
        };
      }),
    );

    // Sort: folders first, then files alphabetically
    items.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    res
      .status(200)
      .json({ items, currentPath: subpath === "." ? "" : subpath });
  } catch (error) {
    console.error("File List Error:", error.message);
    res.status(500).json({ message: "Failed to list files: " + error.message });
  }
};

const readFileContent = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const filepath = req.query.path;
    if (!filepath)
      return res.status(400).json({ message: "No file path provided" });

    const { resolved } = resolveServerPath(server.crafty_server_id, filepath);
    const stat = await fs.stat(resolved);

    // Refuse to read files larger than 5MB for safety
    if (stat.size > 5 * 1024 * 1024) {
      return res
        .status(413)
        .json({ message: "File too large to edit in browser (>5MB)" });
    }

    const content = await fs.readFile(resolved, "utf8");
    res.status(200).json({ content, filepath });
  } catch (error) {
    console.error("File Read Error:", error.message);
    res.status(500).json({ message: "Failed to read file: " + error.message });
  }
};

const writeFileContent = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const { filepath, content } = req.body;
    if (!filepath)
      return res.status(400).json({ message: "No file path provided" });

    const { resolved } = resolveServerPath(server.crafty_server_id, filepath);
    await fs.writeFile(resolved, content || "", "utf8");
    res.status(200).json({ message: "File saved successfully" });
  } catch (error) {
    console.error("File Write Error:", error.message);
    res.status(500).json({ message: "Failed to save file: " + error.message });
  }
};

const deleteFileOrFolder = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const filepath = req.query.path;
    if (!filepath)
      return res.status(400).json({ message: "No file path provided" });

    const { resolved } = resolveServerPath(server.crafty_server_id, filepath);
    const stat = await fs.stat(resolved);

    if (stat.isDirectory()) {
      await fs.rm(resolved, { recursive: true });
    } else {
      await fs.unlink(resolved);
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("File Delete Error:", error.message);
    res.status(500).json({ message: "Failed to delete: " + error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server not found" });

    const destDir = req.body.path || ".";
    const { resolved: resolvedDir } = resolveServerPath(
      server.crafty_server_id,
      destDir,
    );

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const destPath = path.join(resolvedDir, req.file.originalname);
    await fs.writeFile(destPath, req.file.buffer);
    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("File Upload Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to upload file: " + error.message });
  }
};

module.exports = {
  fetchCraftyStatsByCraftyId,
  createNewServer,
  startExistingServer,
  stopExistingServer,
  viewAllServer,
  viewSingleServer,
  deleteServer,
  getLiveServerStatus,
  updateServer,
  getServerLogs,
  sendServerCommand,
  restartServer,
  getServerConfig,
  updateServerConfig,
  listServerFiles,
  readFileContent,
  writeFileContent,
  deleteFileOrFolder,
  uploadFile,
};
