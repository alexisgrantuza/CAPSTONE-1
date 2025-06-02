const Guest = require("../model/Guest");

exports.createGuest = async (req, res) => {
  try {
    // Create guest without timeIn
    const guestData = {
      fullName: req.body.fullName,
      age: req.body.age,
      gender: req.body.gender,
      timeIn: null,
      timeOut: null,
    };

    const guest = await Guest.create(guestData);
    res.status(201).json(guest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.findAll({
      order: [["id", "DESC"]], // Order by ID instead of timeIn
    });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTimeOut = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    if (!guest.timeIn) {
      return res
        .status(400)
        .json({ message: "Cannot record time-out before time-in" });
    }

    guest.timeOut = new Date();
    await guest.save();
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordTimeIn = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findByPk(id);

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    if (guest.timeIn) {
      return res.status(400).json({ message: "Time-in already recorded" });
    }

    // Record time-in only when QR code is scanned
    guest.timeIn = new Date();
    await guest.save();

    res.json({
      message: "Time-in recorded successfully",
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        timeIn: guest.timeIn,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleQRScan = async (req, res) => {
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

    // Check if time-in is already recorded
    if (guest.timeIn) {
      return res
        .status(400)
        .json({ message: "Time-in already recorded for this guest" });
    }

    // Record time-in
    guest.timeIn = new Date();
    await guest.save();

    res.json({
      message: "Time-in recorded successfully",
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        timeIn: guest.timeIn,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
