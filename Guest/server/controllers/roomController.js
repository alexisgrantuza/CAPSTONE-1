const Room = require("../model/Room");
const Guest = require("../model/Guest");
const TimeRecord = require("../model/TimeRecord");

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

exports.timeOutAllGuests = async (req, res) => {
  try {
    const { id } = req.params;

    // Find guests who have time-in records but no time-out records
    const guests = await Guest.findAll({
      where: {
        roomId: id,
        timeOut: null,
      },
      include: [
        {
          model: TimeRecord,
          where: {
            type: "timeIn",
          },
          required: true,
        },
      ],
    });

    // Create time out records for each guest
    const timeOutPromises = guests.map((guest) =>
      TimeRecord.create({
        guestId: guest.id,
        roomId: id,
        type: "timeOut",
        timestamp: new Date(),
      })
    );

    // Update all guests' status
    const updatePromises = guests.map((guest) =>
      Guest.update(
        {
          timeOut: new Date(),
          status: "timed_out",
        },
        {
          where: { id: guest.id },
        }
      )
    );

    // Execute all promises
    await Promise.all([...timeOutPromises, ...updatePromises]);

    res.json({
      success: true,
      message: `Successfully timed out ${guests.length} guests`,
      count: guests.length,
    });
  } catch (error) {
    console.error("Error in timeOutAllGuests:", error);
    res.status(500).json({
      success: false,
      message: "Error timing out guests",
      error: error.message,
    });
  }
};

exports.getRoomStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Get total guests in the room
    const totalGuests = await Guest.count({
      where: { roomId: id },
    });

    // Get guests who are timed in
    const timeInCount = await TimeRecord.count({
      where: {
        roomId: id,
        type: "timeIn",
      },
    });

    // Get guests who are timed out
    const timeOutCount = await TimeRecord.count({
      where: {
        roomId: id,
        type: "timeOut",
      },
    });

    res.json({
      totalGuests,
      timeInCount,
      timeOutCount,
    });
  } catch (error) {
    console.error("Error in getRoomStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room statistics",
      error: error.message,
    });
  }
};
