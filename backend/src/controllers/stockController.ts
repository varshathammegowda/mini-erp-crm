import { Request, Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../middleware/authMiddleware";

// ===============================
// ADD STOCK (IN)
// ===============================
export const addStock = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id || !quantity || !reason) {
      return res.status(400).json({
        message: "Product, quantity and reason are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found",
      });
    }

    await client.query(
      `
      UPDATE products
      SET current_stock = current_stock + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [quantity, product_id]
    );

    const movementResult = await client.query(
      `
      INSERT INTO stock_movements
      (product_id, quantity, movement_type, reason, created_by)
      VALUES ($1, $2, 'IN', $3, $4)
      RETURNING *
      `,
      [product_id, quantity, reason, req.user.id]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Stock added successfully",
      movement: movementResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Add stock error:", error);

    return res.status(500).json({
      message: "Failed to add stock",
    });
  } finally {
    client.release();
  }
};


// ===============================
// REMOVE STOCK (OUT)
// ===============================
export const removeStock = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id || !quantity || !reason) {
      return res.status(400).json({
        message: "Product, quantity and reason are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      `
      SELECT id, current_stock
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found",
      });
    }

    const currentStock = productResult.rows[0].current_stock;

    if (currentStock < Number(quantity)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Insufficient stock",
        availableStock: currentStock,
      });
    }

    await client.query(
      `
      UPDATE products
      SET current_stock = current_stock - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [quantity, product_id]
    );

    const movementResult = await client.query(
      `
      INSERT INTO stock_movements
      (product_id, quantity, movement_type, reason, created_by)
      VALUES ($1, $2, 'OUT', $3, $4)
      RETURNING *
      `,
      [product_id, quantity, reason, req.user.id]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Stock removed successfully",
      movement: movementResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Remove stock error:", error);

    return res.status(500).json({
      message: "Failed to remove stock",
    });
  } finally {
    client.release();
  }
};


// ===============================
// GET STOCK MOVEMENTS
// ===============================
export const getStockMovements = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        sm.id,
        sm.product_id,
        p.product_name,
        p.sku,
        sm.quantity,
        sm.movement_type,
        sm.reason,
        sm.created_by,
        u.name AS created_by_name,
        sm.created_at
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN users u ON sm.created_by = u.id
      ORDER BY sm.created_at DESC
      `
    );

    return res.status(200).json({
      movements: result.rows,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      message: "Failed to fetch stock movements",
    });
  }
};