const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const controller = require("../controllers/serverControllers");

// File Manager
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// TEMP Debug ROUTE to see full Crafty Stats
router.get("/debug/stats/:craftyId", controller.fetchCraftyStatsByCraftyId);
router.post("/create", protect, controller.createNewServer);
router.post("/:id/start", protect, controller.startExistingServer);
router.post("/:id/stop", protect, controller.stopExistingServer);
router.get("/", protect, controller.viewAllServer);
router.get("/:id", protect, controller.viewSingleServer);
router.delete("/:id", protect, controller.deleteServer);
router.get("/:id/status", protect, controller.getLiveServerStatus);
router.patch("/:id/update", protect, controller.updateServer);
router.get("/:id/logs", protect, controller.getServerLogs);
router.post("/:id/command", protect, controller.sendServerCommand);
router.post("/:id/restart", protect, controller.restartServer);
router.get("/:id/config", protect, controller.getServerConfig);
router.patch("/:id/config", protect, controller.updateServerConfig);
router.get("/:id/files", protect, controller.listServerFiles);
router.get("/:id/files/content", protect, controller.readFileContent);
router.put("/:id/files/content", protect, controller.writeFileContent);
router.delete("/:id/files", protect, controller.deleteFileOrFolder);
router.post(
  "/:id/files/upload",
  protect,
  upload.single("file"),
  controller.uploadFile,
);

module.exports = router;
