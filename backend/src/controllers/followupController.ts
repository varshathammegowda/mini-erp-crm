import { Request, Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../middleware/authMiddleware";

export const addFollowUp = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId } = req.params;
    const { note, follow_up_date } = req.body;

    if (!note) {
      return res.status(400).json({
        message: "Follow-up note is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const customer = await pool.query(
      "SELECT id FROM customers WHERE id = $1",
      [customerId]
    );

    if (customer.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO customer_followups
      (customer_id, note, follow_up_date, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        customerId,
        note,
        follow_up_date || null,
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Follow-up added successfully",
      followUp: result.rows[0],
    });
  } catch (error) {
    console.error("Add follow-up error:", error);

    return res.status(500).json({
      message: "Failed to add follow-up",
    });
  }
};