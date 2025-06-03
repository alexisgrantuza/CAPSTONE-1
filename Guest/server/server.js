const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const sequelize = require("./config/database");
const guestRoutes = require("./routes/guestRoutes");
const authRoutes = require("./routes/authRoutes");
const authController = require("./controllers/authController");
const auth = require("./middleware/auth");
const Guest = require("./model/Guest");
const TimeRecord = require("./model/TimeRecord");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/guests", guestRoutes);
app.use("/api/auth", authRoutes);

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
        await handleQRScan(scannedData);
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

// Handle QR code scan
async function handleQRScan(data) {
  const timestamp = new Date().toLocaleString();

  console.log("\n" + "=".repeat(50));
  console.log("🎯 QR/BARCODE SCANNED!");
  console.log("=".repeat(50));
  console.log(`📅 Time: ${timestamp}`);
  console.log(`📊 Data: ${data}`);
  console.log(`📏 Length: ${data.length} characters`);
  console.log("=".repeat(50) + "\n");

  try {
    // Parse the scanned data
    const match = data.match(
      /ID: (\d+), Name: ([^,]+), Age: (\d+), Gender: ([^,]+)/
    );
    if (!match) {
      console.error("❌ Invalid QR code format");
      return;
    }

    const [, id, name, age, gender] = match;

    // Make a request to the scan endpoint
    const response = await fetch("http://localhost:3000/api/guests/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, age, gender }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Error: ${result.message}`);
      return;
    }

    console.log(`✅ ${result.message}`);
  } catch (error) {
    console.error("❌ Error processing scan:", error.message);
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
