const Room = require("../model/Room");

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(rooms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rooms", error: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room", error: error.message });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { title, description, code } = req.body;

    // Check if room with code already exists
    const existingRoom = await Room.findOne({ where: { code } });
    if (existingRoom) {
      return res.status(400).json({ message: "Room code already exists" });
    }

    const room = await Room.create({
      title,
      description,
      code,
    });

    res.status(201).json(room);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.destroy();
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting room", error: error.message });
  }
};

// Get room by code
exports.getRoomByCode = async (req, res) => {
  try {
    const room = await Room.findOne({ where: { code: req.params.code } });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room", error: error.message });
  }
};
