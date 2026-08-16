import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../middleware/authMiddleware";

interface ChallanItem {
  product_id: number;
  quantity: number;
}

// ========================================
// CREATE CHALLAN
// ========================================

export const createChallan = async (
  req: AuthRequest,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { customer_id, items, status } = req.body;

    if (
      !customer_id ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Customer and at least one product are required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const challanStatus = status || "Draft";

    if (
      !["Draft", "Confirmed"].includes(challanStatus)
    ) {
      return res.status(400).json({
        message:
          "Status must be Draft or Confirmed",
      });
    }

    await client.query("BEGIN");

    // ----------------------------------------
    // Check customer
    // ----------------------------------------

    const customerResult = await client.query(
      `
      SELECT id, customer_name
      FROM customers
      WHERE id = $1
      `,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // ----------------------------------------
    // Generate challan number
    // ----------------------------------------

    const numberResult = await client.query(
      `
      SELECT COUNT(*) + 1 AS next_number
      FROM challans
      `
    );

    const nextNumber = Number(
      numberResult.rows[0].next_number
    );

    const challanNumber = `CH-${String(
      nextNumber
    ).padStart(4, "0")}`;

    const processedItems: any[] = [];
    let totalQuantity = 0;

    // ----------------------------------------
    // Process products
    // ----------------------------------------

    for (const item of items as ChallanItem[]) {
      if (
        !item.product_id ||
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            "Each product must have a valid product ID and quantity",
        });
      }

      const productResult = await client.query(
        `
        SELECT
          id,
          product_name,
          sku,
          unit_price,
          current_stock
        FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: `Product ${item.product_id} not found`,
        });
      }

      const product = productResult.rows[0];
      const quantity = Number(item.quantity);

      // ----------------------------------------
      // Check stock for confirmed challan
      // ----------------------------------------

      if (
        challanStatus === "Confirmed" &&
        Number(product.current_stock) < quantity
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: `Insufficient stock for ${product.product_name}`,
          availableStock: Number(
            product.current_stock
          ),
          requestedQuantity: quantity,
        });
      }

      // ----------------------------------------
      // Store product snapshot
      // ----------------------------------------

      processedItems.push({
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity,
      });

      totalQuantity += quantity;
    }

    // ----------------------------------------
    // Create challan
    // ----------------------------------------

    const challanResult = await client.query(
      `
      INSERT INTO challans
      (
        challan_number,
        customer_id,
        total_quantity,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        challanNumber,
        customer_id,
        totalQuantity,
        challanStatus,
        req.user.id,
      ]
    );

    const challan = challanResult.rows[0];

    // ----------------------------------------
    // Insert challan items
    // ----------------------------------------

    for (const item of processedItems) {
      await client.query(
        `
        INSERT INTO challan_items
        (
          challan_id,
          product_id,
          product_name,
          sku,
          unit_price,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          challan.id,
          item.product_id,
          item.product_name,
          item.sku,
          item.unit_price,
          item.quantity,
        ]
      );

      // ----------------------------------------
      // Confirmed challan reduces stock
      // ----------------------------------------

      if (challanStatus === "Confirmed") {
        await client.query(
          `
          UPDATE products
          SET current_stock = current_stock - $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [
            item.quantity,
            item.product_id,
          ]
        );

        // --------------------------------------
        // Create OUT stock movement
        // --------------------------------------

        await client.query(
          `
          INSERT INTO stock_movements
          (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
          )
          VALUES ($1, $2, 'OUT', $3, $4)
          `,
          [
            item.product_id,
            item.quantity,
            `Sales Challan ${challanNumber}`,
            req.user.id,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: `Challan ${challanStatus} created successfully`,
      challan,
      items: processedItems,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Create challan error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create challan",
    });
  } finally {
    client.release();
  }
};

// ========================================
// GET ALL CHALLANS
// WITH SEARCH + PAGINATION
// ========================================

export const getChallans = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // ----------------------------------------
    // Pagination
    // ----------------------------------------

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    // ----------------------------------------
    // Search
    // ----------------------------------------

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const searchPattern = `%${search}%`;

    // ----------------------------------------
    // Get total matching challans
    // ----------------------------------------

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM challans c
      JOIN customers cu
        ON c.customer_id = cu.id
      WHERE
        $1 = ''
        OR c.challan_number ILIKE $2
        OR cu.customer_name ILIKE $2
        OR c.status ILIKE $2
      `,
      [search, searchPattern]
    );

    const total = Number(
      countResult.rows[0].total
    );

    // ----------------------------------------
    // Get paginated challans
    // ----------------------------------------

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.challan_number,
        c.customer_id,
        cu.customer_name,
        c.total_quantity,
        c.status,
        c.created_by,
        u.name AS created_by_name,
        c.created_at
      FROM challans c
      JOIN customers cu
        ON c.customer_id = cu.id
      JOIN users u
        ON c.created_by = u.id
      WHERE
        $1 = ''
        OR c.challan_number ILIKE $2
        OR cu.customer_name ILIKE $2
        OR c.status ILIKE $2
      ORDER BY c.created_at DESC
      LIMIT $3
      OFFSET $4
      `,
      [
        search,
        searchPattern,
        limit,
        offset,
      ]
    );

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    return res.status(200).json({
      challans: result.rows,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get challans error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch challans",
    });
  }
};

// ========================================
// GET CHALLAN BY ID
// ========================================

export const getChallanById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const challanResult = await pool.query(
      `
      SELECT
        c.*,
        cu.customer_name,
        cu.mobile,
        cu.email,
        u.name AS created_by_name
      FROM challans c
      JOIN customers cu
        ON c.customer_id = cu.id
      JOIN users u
        ON c.created_by = u.id
      WHERE c.id = $1
      `,
      [id]
    );

    if (challanResult.rows.length === 0) {
      return res.status(404).json({
        message: "Challan not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        id,
        product_id,
        product_name,
        sku,
        unit_price,
        quantity
      FROM challan_items
      WHERE challan_id = $1
      ORDER BY id
      `,
      [id]
    );

    return res.status(200).json({
      challan: challanResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error(
      "Get challan error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch challan",
    });
  }
};

// ========================================
// CANCEL CHALLAN
// ========================================

export const cancelChallan = async (
  req: AuthRequest,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const challanId = Number(id);

    if (!Number.isInteger(challanId)) {
      return res.status(400).json({
        message: "Invalid challan ID",
      });
    }

    await client.query("BEGIN");

    // ----------------------------------------
    // Lock challan
    // ----------------------------------------

    const challanResult = await client.query(
      `
      SELECT
        id,
        challan_number,
        status,
        total_quantity
      FROM challans
      WHERE id = $1
      FOR UPDATE
      `,
      [challanId]
    );

    if (challanResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Challan not found",
      });
    }

    const challan = challanResult.rows[0];

    // ----------------------------------------
    // Already cancelled
    // ----------------------------------------

    if (challan.status === "Cancelled") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Challan is already cancelled",
      });
    }

    // ----------------------------------------
    // Get challan items
    // ----------------------------------------

    const itemsResult = await client.query(
      `
      SELECT
        product_id,
        product_name,
        quantity
      FROM challan_items
      WHERE challan_id = $1
      ORDER BY id
      `,
      [challanId]
    );

    // ----------------------------------------
    // If confirmed, restore stock
    // ----------------------------------------

    if (challan.status === "Confirmed") {
      for (const item of itemsResult.rows) {
        const productResult =
          await client.query(
            `
            SELECT
              id,
              product_name,
              current_stock
            FROM products
            WHERE id = $1
            FOR UPDATE
            `,
            [item.product_id]
          );

        if (productResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return res.status(404).json({
            message:
              `Product ${item.product_id} not found while cancelling challan`,
          });
        }

        // Restore stock
        await client.query(
          `
          UPDATE products
          SET current_stock = current_stock + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [
            item.quantity,
            item.product_id,
          ]
        );

        // Create IN stock movement
        await client.query(
          `
          INSERT INTO stock_movements
          (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
          )
          VALUES ($1, $2, 'IN', $3, $4)
          `,
          [
            item.product_id,
            item.quantity,
            `Cancelled Challan ${challan.challan_number}`,
            req.user.id,
          ]
        );
      }
    }

    // ----------------------------------------
    // Mark challan as cancelled
    // ----------------------------------------

    const updatedResult = await client.query(
      `
      UPDATE challans
      SET status = 'Cancelled'
      WHERE id = $1
      RETURNING *
      `,
      [challanId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message:
        `Challan ${challan.challan_number} cancelled successfully`,
      challan: updatedResult.rows[0],
      stockRestored:
        challan.status === "Confirmed",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Cancel challan error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel challan",
    });
  } finally {
    client.release();
  }
};