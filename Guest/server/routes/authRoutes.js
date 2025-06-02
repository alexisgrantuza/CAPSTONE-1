const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/login", authController.login);
router.get("/validate", auth, authController.validateToken);

module.exports = router;
