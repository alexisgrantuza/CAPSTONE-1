const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const sequelize = require("./config/database");
const guestRoutes = require("./routes/guestRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const authController = require("./controllers/authController");
const auth = require("./middleware/auth");
const { processQRScan } = require("./controllers/guestController");
// const Guest = require("./model/Guest"); // No longer needed for roomId lookup here

const app = express();

// In-memory storage for the last global scan result
let lastGlobalScanResult = null;

// Middleware
app.use(cors({ origin: "https://prismatic-faloodeh-811c96.netlify.app/" }));
app.use(express.json());

// New endpoint to get the last global scan result
app.get("/api/last-scan-result", (req, res) => {
  const result = lastGlobalScanResult;
  if (result) {
    lastGlobalScanResult = null; // Clear result after retrieval
    res.json(result);
  } else {
    res.json(null); // No new result
  }
});

// Routes
app.use("/api/guests", guestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Serial Port Setup
let port = null;
let parser = null;

async function setupSerialPort() {
  try {
    const ports = await SerialPort.list();
    console.log("📱 Available Serial Ports:");
    ports.forEach((port, index) => {
      console.log(
        `  ${index + 1}. ${port.path} - ${port.manufacturer || "Unknown"}`
      );
    });

    // Auto-detect Arduino port or use the first available port
    let arduinoPort = ports.find(
      (port) =>
        port.manufacturer &&
        (port.manufacturer.toLowerCase().includes("arduino") ||
          port.manufacturer.toLowerCase().includes("ch340") ||
          port.manufacturer.toLowerCase().includes("ftdi"))
    );

    if (!arduinoPort) {
      arduinoPort = ports[0]; // Use first port if no Arduino detected
      console.log("⚠️  Arduino not auto-detected, using first available port");
    }

    if (!arduinoPort) {
      console.log("❌ No serial ports found. Make sure Arduino is connected.");
      return;
    }

    console.log(`🎯 Selected port: ${arduinoPort.path}\n`);

    // Create and configure serial port
    port = new SerialPort({
      path: arduinoPort.path,
      baudRate: 115200,
      autoOpen: false,
    });

    // Create parser for line-based communication
    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    // Set up event handlers
    parser.on("data", async (data) => {
      const trimmedData = data.trim();
      console.log(`📨 Raw data: ${trimmedData}`);

      if (trimmedData.startsWith("QR_SCAN:")) {
        // Extract the scanned data
        const scannedData = trimmedData.substring(8); // Remove 'QR_SCAN:' prefix
        // Process scan data and store result globally
        const result = await processQRScan(scannedData);
        lastGlobalScanResult = result; // Store result globally
        console.log("Stored global scan result:", result);
      } else if (trimmedData === "ARDUINO_READY") {
        console.log("🤖 Arduino is ready!");
      } else if (trimmedData === "USB_READY") {
        console.log("🔌 USB Host Shield initialized");
      } else if (trimmedData === "SCANNER_READY") {
        console.log("📷 QR/Barcode scanner is ready!");
        console.log("👀 Waiting for scans...");
      }
    });

    port.on("error", (error) => {
      console.error("❌ Serial Port Error:", error.message);
    });

    // Open the port
    await new Promise((resolve, reject) => {
      port.open((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log("✅ Successfully connected to Arduino!");
  } catch (error) {
    console.error("❌ Error setting up serial port:", error.message);
  }
}

// Protected routes
app.use("/api/admin/*", auth);

// Database sync and server start
const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(async () => {
    // Create initial admin user
    await authController.createInitialAdmin();

    // Setup serial port
    await setupSerialPort();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down...");
  if (port && port.isOpen) {
    await new Promise((resolve) => {
      port.close(resolve);
    });
  }
  process.exit(0);
});
