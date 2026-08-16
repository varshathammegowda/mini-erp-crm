import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database";

import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import followupRoutes from "./routes/followupRoutes";
import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import challanRoutes from "./routes/challanRoutes";

import { authenticateToken } from "./middleware/authMiddleware";
import { authorizeRoles } from "./middleware/roleMiddleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api", followupRoutes);

app.use("/api/products", productRoutes);

app.use("/api/stock", stockRoutes);

app.use("/api/challans", challanRoutes);


// ===============================
// BASIC TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Mini ERP CRM API is running",
  });
});


// ===============================
// DATABASE HEALTH CHECK
// ===============================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "success",
      message: "Server and database are connected",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});


// ===============================
// PROTECTED TEST ROUTE
// ===============================

app.get(
  "/api/protected",
  authenticateToken,
  (req, res) => {
    res.json({
      message: "You have access to this protected route",
      user: (req as any).user,
    });
  }
);


// ===============================
// ADMIN ONLY TEST ROUTE
// ===============================

app.get(
  "/api/admin-only",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have access to this route.",
    });
  }
);


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});