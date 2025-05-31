const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const guestRoutes = require("./routes/guestRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/guests", guestRoutes);

// Database sync and server start
const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
