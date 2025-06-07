const Room = require("../model/Room");
const Guest = require("../model/Guest");
const TimeRecord = require("../model/TimeRecord");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

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
    const roomId = req.params.id;

    // Find the room first
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Delete all associated time records first
    await TimeRecord.destroy({
      where: { roomId },
    });

    // Delete all associated guests
    await Guest.destroy({
      where: { roomId },
    });

    // Finally delete the room
    await room.destroy();

    res.json({
      success: true,
      message: "Room and all associated records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
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

    // Get all unique guests who have time records in this room
    const guestsInRoom = await TimeRecord.findAll({
      where: { roomId: id },
      attributes: ["guestId"],
      group: ["guestId"],
      raw: true,
    });

    if (guestsInRoom.length === 0) {
      return res.json({
        success: true,
        message: "No guests found in this room",
        count: 0,
      });
    }

    // For each guest, find their latest record and check if they need timeout
    const guestIdsToTimeOut = [];

    for (const guestRecord of guestsInRoom) {
      const latestRecord = await TimeRecord.findOne({
        where: {
          guestId: guestRecord.guestId,
          roomId: id,
        },
        order: [
          ["timestamp", "DESC"],
          ["id", "DESC"],
        ], // Order by timestamp and id for consistency
      });

      // If the latest record is 'timeIn', this guest needs to be timed out
      if (latestRecord && latestRecord.type === "timeIn") {
        guestIdsToTimeOut.push(guestRecord.guestId);
      }
    }

    if (guestIdsToTimeOut.length === 0) {
      return res.json({
        success: true,
        message: "No guests currently need to be timed out",
        count: 0,
      });
    }

    // Check for existing timeouts and only create new ones for guests who don't have them
    const currentTime = new Date();
    const timeOutRecords = [];

    for (const guestId of guestIdsToTimeOut) {
      // Check if there's already a timeout record for this guest in the last 24 hours
      const recentTimeout = await TimeRecord.findOne({
        where: {
          guestId,
          type: "timeOut",
          timestamp: {
            [Op.gte]: new Date(currentTime - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        order: [["timestamp", "DESC"]],
        limit: 1,
      });

      if (!recentTimeout) {
        timeOutRecords.push({
          guestId,
          roomId: id,
          type: "timeOut",
          timestamp: currentTime,
        });
      }
    }

    // Only create timeout records for guests who don't have recent timeouts
    if (timeOutRecords.length > 0) {
      await TimeRecord.bulkCreate(timeOutRecords);
    }

    res.json({
      success: true,
      message: `Successfully timed out ${guestIdsToTimeOut.length} guests`,
      count: guestIdsToTimeOut.length,
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

    // Get total number of unique guests who have visited the room
    const totalGuests = await Guest.count({
      where: {
        roomId: id,
      },
    });

    // Subquery to find the latest TimeRecord ID for each guest in the room
    const latestRecordIdsSubquery = await TimeRecord.findAll({
      attributes: [[sequelize.fn("MAX", sequelize.col("id")), "latestId"]],
      where: {
        roomId: id,
      },
      group: ["guestId"],
      raw: true, // Return plain data
    });

    const latestIds = latestRecordIdsSubquery.map((record) => record.latestId);

    // If there are no time records, counts are 0
    if (latestIds.length === 0) {
      return res.json({
        totalGuests,
        timeInCount: 0,
        timeOutCount: 0,
      });
    }

    // Find the actual latest TimeRecords based on the IDs
    const latestTimeRecords = await TimeRecord.findAll({
      where: {
        id: {
          [Op.in]: latestIds,
        },
        roomId: id, // Double-check room ID
      },
    });

    // Count guests based on the type of their latest record
    let timeInCount = 0;
    let timeOutCount = 0;

    latestTimeRecords.forEach((record) => {
      if (record.type === "timeIn") {
        timeInCount++;
      } else if (record.type === "timeOut") {
        timeOutCount++;
      }
    });

    res.json({
      totalGuests, // Total number of unique guests
      timeInCount, // Guests whose latest action is time-in
      timeOutCount, // Guests whose latest action is time-out
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
