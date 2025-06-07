const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);

      // Find admin by username
      const admin = await Admin.findOne({ where: { username } });
      console.log("Admin found:", admin ? "Yes" : "No");

      if (!admin) {
        console.log("No admin found with username:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      console.log("Password valid:", isValidPassword);

      if (!isValidPassword) {
        console.log("Invalid password for username:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      console.log("Login successful for username:", username);
      res.json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  validateToken: async (req, res) => {
    try {
      // If we reach here, the token is valid (auth middleware already verified it)
      res.json({ valid: true });
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  createInitialAdmin: async () => {
    try {
      // Check if admin already exists
      const adminExists = await Admin.findOne();
      if (adminExists) {
        console.log("Admin already exists, skipping creation");
        return;
      }

      // Create default admin
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await Admin.create({
        username: "admin",
        password: hashedPassword,
      });

      console.log("✅ Initial admin user created");
    } catch (error) {
      console.error("Error creating initial admin:", error);
    }
  },
};

module.exports = authController;
