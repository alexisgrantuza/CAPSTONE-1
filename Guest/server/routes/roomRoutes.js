const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const auth = require("../middleware/auth");

// Protected routes (require authentication)
router.get("/", auth, roomController.getAllRooms);
router.get("/:id", auth, roomController.getRoomById);
router.post("/", auth, roomController.createRoom);
router.delete("/:id", auth, roomController.deleteRoom);

// Public route (no authentication required)
router.get("/code/:code", roomController.getRoomByCode);

module.exports = router;
