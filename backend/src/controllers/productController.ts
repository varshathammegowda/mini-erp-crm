import { Request, Response } from "express";
import pool from "../config/database";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      product_name,
      sku,
      category,
      unit_price,
      current_stock,
      minimum_stock,
      warehouse,
    } = req.body;

    if (
      !product_name ||
      !sku ||
      !category ||
      unit_price === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        message:
          "Product name, SKU, category, unit price and warehouse are required",
      });
    }

    if (Number(unit_price) < 0) {
      return res.status(400).json({
        message: "Unit price cannot be negative",
      });
    }

    if (Number(current_stock || 0) < 0) {
      return res.status(400).json({
        message: "Current stock cannot be negative",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products
      (
        product_name,
        sku,
        category,
        unit_price,
        current_stock,
        minimum_stock,
        warehouse
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        product_name,
        sku,
        category,
        unit_price,
        current_stock || 0,
        minimum_stock || 0,
        warehouse,
      ]
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    return res.status(200).json({
      products: result.rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      sku,
      category,
      unit_price,
      current_stock,
      minimum_stock,
      warehouse,
    } = req.body;

    if (
      !product_name ||
      !sku ||
      !category ||
      unit_price === undefined ||
      current_stock === undefined ||
      minimum_stock === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        message: "All product fields are required",
      });
    }

    if (Number(unit_price) < 0 || Number(current_stock) < 0 || Number(minimum_stock) < 0) {
      return res.status(400).json({
        message: "Price and stock values cannot be negative",
      });
    }

    const result = await pool.query(
      `
      UPDATE products
      SET
        product_name = $1,
        sku = $2,
        category = $3,
        unit_price = $4,
        current_stock = $5,
        minimum_stock = $6,
        warehouse = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        product_name,
        sku,
        category,
        unit_price,
        current_stock,
        minimum_stock,
        warehouse,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};