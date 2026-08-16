import { Request, Response } from "express";
import pool from "../config/database";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      mobile,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes,
    } = req.body;

    if (!customer_name || !mobile || !business_name || !customer_type || !address) {
      return res.status(400).json({
        message:
          "Customer name, mobile, business name, customer type and address are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO customers
      (
        customer_name,
        mobile,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        customer_name,
        mobile,
        email || null,
        business_name,
        gst_number || null,
        customer_type,
        address,
        status || "Lead",
        follow_up_date || null,
        notes || null,
      ]
    );

    return res.status(201).json({
      message: "Customer created successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      message: "Failed to create customer",
    });
  }
};
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY created_at DESC"
    );

    return res.status(200).json({
      customers: result.rows,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;

    if (!search) {
      return res.status(400).json({
        message: "Search term is required",
      });
    }

    const result = await pool.query(
      `
      SELECT * FROM customers
      WHERE customer_name ILIKE $1
         OR mobile ILIKE $1
         OR email ILIKE $1
         OR business_name ILIKE $1
      ORDER BY created_at DESC
      `,
      [`%${search}%`]
    );

    return res.status(200).json({
      customers: result.rows,
    });
  } catch (error) {
    console.error("Search customers error:", error);

    return res.status(500).json({
      message: "Failed to search customers",
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      customer_name,
      mobile,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE customers
      SET
        customer_name = $1,
        mobile = $2,
        email = $3,
        business_name = $4,
        gst_number = $5,
        customer_type = $6,
        address = $7,
        status = $8,
        follow_up_date = $9,
        notes = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
      `,
      [
        customer_name,
        mobile,
        email || null,
        business_name,
        gst_number || null,
        customer_type,
        address,
        status,
        follow_up_date || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: "Customer updated successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM customers WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};
