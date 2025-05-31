const Guest = require("../model/Guest");

exports.createGuest = async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    res.status(201).json(guest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.findAll({
      order: [["timeIn", "DESC"]],
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

    guest.timeOut = new Date();
    await guest.save();
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
