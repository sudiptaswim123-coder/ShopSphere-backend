
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

const clientUrlConfig = process.env.CLIENT_URL;

if (!clientUrlConfig && process.env.NODE_ENV === "production") {
  throw new Error("CLIENT_URL must be set in production.");
}

const clientUrls = clientUrlConfig
  ? clientUrlConfig.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

if (clientUrls.some((url) => !url)) {
  throw new Error("CLIENT_URL must contain comma-separated frontend origins.");
}

const allowedOrigins = new Set(
  clientUrls.map((clientUrl) => {
    let parsedUrl;

    try {
      parsedUrl = new URL(clientUrl);
    } catch {
      throw new Error(`Invalid frontend origin in CLIENT_URL: ${clientUrl}`);
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.pathname !== "/" ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      throw new Error(
        `CLIENT_URL must contain only frontend origins (scheme and host): ${clientUrl}`
      );
    }

    return parsedUrl.origin;
  })
);

/* ==============================
   DATABASE
================================ */

connectDB();

/* ==============================
   MIDDLEWARE
================================ */

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
  })
);

app.use(express.json());

/* ==============================
   BASIC ROUTE
================================ */

app.get("/", (req, res) => {
  res.json({
    message: "ShopSphere API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* ==============================
   AUTH ROUTES
================================ */

app.use("/api/auth", authRoutes);

/* ==============================
   PRODUCT ROUTES
================================ */

app.use("/api/products", productRoutes);

/* ==============================
  ORDER ROUTES
================================ */

app.use("/api/orders", orderRoutes);

/* ==============================
  USER ROUTES
================================ */

app.use("/api/users", userRoutes);

/* ==============================
   SERVER
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
