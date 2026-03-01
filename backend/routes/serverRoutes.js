const express = require("express");
const axios = require("axios");
const fs = require("fs").promises; // Node's built-in file system module
const path = require("path");
const router = express.Router();
const Server = require("../models/Server"); // Your MongoDB Server schema

// 🔧 Helper setup for talking to Crafty
// This prevents us from having to type the headers and SSL bypass on every single request
const craftyApi = axios.create({
  baseURL: process.env.CRAFTY_API_URL,
  headers: { Authorization: `Bearer ${process.env.CRAFTY_API_TOKEN}` },
  httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }), // Bypasses local SSL warnings
});

// ==========================================
// ROUTE 1: Create a New Minecraft Server
// ==========================================
router.post("/create", async (req, res) => {
  try {
    const { serverName, ownerId } = req.body;

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
      owner: ownerId,
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
});

// ==========================================
// ROUTE 2: Start an Existing Server
// ==========================================
router.post("/:id/start", async (req, res) => {
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
});

// ==========================================
// ROUTE 3: Stop an Existing Server
// ==========================================
router.post("/:id/stop", async (req, res) => {
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
});

// ==========================================
// ROUTE 4: View All Servers (Bypass Compass)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const servers = await Server.find();
    res.status(200).json(servers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch servers from database" });
  }
});

module.exports = router;
