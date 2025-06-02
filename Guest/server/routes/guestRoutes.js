const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");

router.post("/", guestController.createGuest);
router.get("/", guestController.getAllGuests);
router.put("/:id/timeout", guestController.updateTimeOut);
router.put("/:id/timein", guestController.recordTimeIn);
router.post("/scan", guestController.handleQRScan);

module.exports = router;
