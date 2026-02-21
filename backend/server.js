const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const materialsRoutes = require("./routes/materials");
const transactionsRoutes = require("./routes/transactions");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 8080;

/* =========================
   CORS Configuration
========================= */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   Request Logger
========================= */

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

/* =========================
   Root Route (Fix Cannot GET /)
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Voltran Backend API is running on Render");
});

/* =========================
   API Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* =========================
   Health Check
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

/* =========================
   Start Server
========================= */

app.listen(PORT, () => {
  console.log(`\n⚡ Voltran API Server running on port ${PORT}`);
});