
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

/* ==============================
   DATABASE
================================ */

connectDB();

/* ==============================
   MIDDLEWARE
================================ */

app.use(
  cors({
    origin: "http://localhost:5173",
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
