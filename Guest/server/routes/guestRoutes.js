const express = require("express");
const router = express.Router();
const Guest = require("../model/Guest");
const TimeRecord = require("../model/TimeRecord");
const auth = require("../middleware/auth");

// Get all guests with their time records
router.get("/", auth, async (req, res) => {
  try {
    const guests = await Guest.findAll({
      include: [
        {
          model: TimeRecord,
          order: [["timestamp", "DESC"]],
        },
      ],
    });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new guest
router.post("/", async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Handle QR code scan
router.post("/scan", async (req, res) => {
  try {
    const { id, name, age, gender } = req.body;

    // Find the guest in the database
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Verify the guest details match
    if (
      guest.fullName !== name ||
      guest.age.toString() !== age.toString() ||
      guest.gender !== gender
    ) {
      return res.status(400).json({ message: "Guest details do not match" });
    }

    // Get the latest time record
    const latestRecord = await TimeRecord.findOne({
      where: { guestId: guest.id },
      order: [["timestamp", "DESC"]],
    });

    // If no records exist or the last record was a time-out, create a time-in
    if (!latestRecord || latestRecord.type === "timeOut") {
      await TimeRecord.create({
        guestId: guest.id,
        type: "timeIn",
        timestamp: new Date(),
      });
      res.json({ message: "Time-in recorded successfully" });
    } else {
      // If the last record was a time-in, create a time-out
      await TimeRecord.create({
        guestId: guest.id,
        type: "timeOut",
        timestamp: new Date(),
      });
      res.json({ message: "Time-out recorded successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record time out
router.put("/:id/timeout", auth, async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Get the latest time record
    const latestRecord = await TimeRecord.findOne({
      where: { guestId: guest.id },
      order: [["timestamp", "DESC"]],
    });

    // Check if the latest record is already a time-out
    if (latestRecord && latestRecord.type === "timeOut") {
      return res
        .status(400)
        .json({ message: "Guest has already been logged out" });
    }

    // Create time-out record
    await TimeRecord.create({
      guestId: guest.id,
      type: "timeOut",
      timestamp: new Date(),
    });

    res.json({ message: "Time out recorded successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a guest and all their time records
router.delete("/:id", auth, async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Delete all time records first (due to foreign key constraint)
    await TimeRecord.destroy({
      where: { guestId: guest.id },
    });

    // Then delete the guest
    await guest.destroy();
    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
