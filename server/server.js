const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const web3Utils = require("./utils/web3Utils");
const { startElectionScheduler } = require("./utils/electionScheduler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Web3
web3Utils.initialize().catch((err) => {
  console.error("Failed to initialize Web3:", err);
  console.log("⚠️  Server running without blockchain connection");
});

// Start election status scheduler
startElectionScheduler();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/votes", require("./routes/voteRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    success: true,
    system: {
      status: 'operational',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      blockchain: web3Utils.contract ? "Connected" : "Disconnected",
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    blockchain: web3Utils.contract ? "Connected" : "Disconnected",
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blockchain Voting System API",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
