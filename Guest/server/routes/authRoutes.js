const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const Admin = require("../model/Admin") ;

router.post("/login", authController.login);
router.get("/validate", auth, authController.validateToken);
router.get("/check-admin", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status" });
  }
});

module.exports = router;
