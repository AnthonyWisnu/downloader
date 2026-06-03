require("dotenv").config();

const cors = require("cors");
const express = require("express");
const downloadRoutes = require("./routes/download.routes");
const { validateInstagramCookiesOnStartup } = require("./services/cookies.service");

const app = express();
const port = Number(process.env.PORT || 3001);
const frontendUrl =
  process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = new Set(frontendUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin tidak diizinkan"));
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/api", downloadRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.use((error, req, res, next) => {
  const message = error.message || "Server error";

  res.status(500).json({
    error: message.startsWith("ERR:") ? message : `ERR: ${message}`
  });
});

if (require.main === module) {
  validateInstagramCookiesOnStartup();
  const server = app.listen(port);
  server.timeout = 300000;
}

module.exports = app;
