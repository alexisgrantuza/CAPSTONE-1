const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const auth = require("../middleware/auth");
const Guest = require("../model/Guest");
const Room = require("../model/Room");

// Protected routes (require authentication)
router.get("/", auth, roomController.getAllRooms);
router.get("/:id", auth, roomController.getRoomById);
router.post("/", auth, roomController.createRoom);
router.delete("/:id", auth, roomController.deleteRoom);

// Public routes (no authentication required)
router.get("/code/:code", roomController.getRoomByCode);
router.get("/code/:code/guests", async (req, res) => {
  try {
    const room = await Room.findOne({ where: { code: req.params.code } });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const guests = await Guest.findAll({
      where: { roomId: room.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Time out all guests in a room
router.post("/:id/timeout-all", roomController.timeOutAllGuests);

// Get room statistics
router.get("/:id/stats", roomController.getRoomStats);

module.exports = router;
