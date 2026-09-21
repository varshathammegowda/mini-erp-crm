import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://mini-erp-crm-3-24mk.onrender.com/api";

function Stock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [movementType, setMovementType] = useState("IN");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [productsResponse, movementsResponse] =
        await Promise.all([
          axios.get(
            `${API}/products`,
            getConfig()
          ),
          axios.get(
            `${API}/stock/movements`,
            getConfig()
          ),
        ]);

      setProducts(
        productsResponse.data.products || []
      );

      setMovements(
        movementsResponse.data.movements || []
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load stock data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (Number(quantity) <= 0) {
      setError(
        "Quantity must be greater than zero."
      );
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    try {
      setSaving(true);

      const endpoint =
        movementType === "IN"
          ? `${API}/stock/in`
          : `${API}/stock/out`;

      const response = await axios.post(
        endpoint,
        {
          product_id: Number(productId),
          quantity: Number(quantity),
          reason: reason.trim(),
        },
        getConfig()
      );

      setMessage(
        response.data.message ||
          "Stock movement completed successfully."
      );

      setProductId("");
      setQuantity(1);
      setReason("");

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to update stock"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Stock Management
            </h1>

            <p style={subtitleStyle}>
              Manage inventory IN and OUT movements.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.href = "/dashboard")
            }
            style={secondaryButton}
          >
            ← Dashboard
          </button>
        </div>

        {/* MESSAGES */}

        {message && (
          <div style={successBox}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        {/* STOCK MOVEMENT FORM */}

        <div style={cardStyle}>
          <h2>Stock Movement</h2>

          <p style={subtitleStyle}>
            Add incoming stock or remove outgoing stock.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={formGrid}>
              <div>
                <label style={labelStyle}>
                  Movement Type *
                </label>

                <select
                  value={movementType}
                  onChange={(e) =>
                    setMovementType(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="IN">
                    Stock IN
                  </option>

                  <option value="OUT">
                    Stock OUT
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Product *
                </label>

                <select
                  value={productId}
                  onChange={(e) =>
                    setProductId(e.target.value)
                  }
                  style={inputStyle}
                  required
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_name} — Stock:{" "}
                      {product.current_stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Quantity *
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Reason *
                </label>

                <input
                  type="text"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  placeholder="e.g. New stock received"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={buttonRow}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButton,
                  background:
                    movementType === "IN"
                      ? "#16a34a"
                      : "#dc2626",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving
                  ? "Processing..."
                  : movementType === "IN"
                  ? "Add Stock"
                  : "Remove Stock"}
              </button>
            </div>
          </form>
        </div>

        {/* CURRENT INVENTORY */}

        <div style={cardStyle}>
          <h2>Current Inventory</h2>

          {loading ? (
            <p>Loading inventory...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Product
                    </th>

                    <th style={thStyle}>
                      SKU
                    </th>

                    <th style={thStyle}>
                      Current Stock
                    </th>

                    <th style={thStyle}>
                      Minimum Stock
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stock = Number(
                      product.current_stock
                    );

                    const minimum = Number(
                      product.minimum_stock
                    );

                    const lowStock =
                      stock <= minimum;

                    return (
                      <tr key={product.id}>
                        <td style={tdStyle}>
                          {product.product_name}
                        </td>

                        <td style={tdStyle}>
                          {product.sku}
                        </td>

                        <td style={tdStyle}>
                          <strong>
                            {stock}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {minimum}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              background:
                                lowStock
                                  ? "#fee2e2"
                                  : "#dcfce7",
                              color:
                                lowStock
                                  ? "#991b1b"
                                  : "#166534",
                            }}
                          >
                            {lowStock
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MOVEMENT HISTORY */}

        <div style={cardStyle}>
          <h2>Movement History</h2>

          {loading ? (
            <p>Loading movements...</p>
          ) : movements.length === 0 ? (
            <p>No stock movements found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Quantity</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Reason</th>
                    <th style={thStyle}>Created By</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map((movement) => {
                    const isIn =
                      movement.movement_type ===
                      "IN";

                    return (
                      <tr key={movement.id}>
                        <td style={tdStyle}>
                          {movement.product_name}
                        </td>

                        <td style={tdStyle}>
                          {movement.quantity}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...badgeStyle,
                              background: isIn
                                ? "#dcfce7"
                                : "#fee2e2",
                              color: isIn
                                ? "#166534"
                                : "#991b1b",
                            }}
                          >
                            {movement.movement_type}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {movement.reason}
                        </td>

                        <td style={tdStyle}>
                          {movement.created_by_name}
                        </td>

                        <td style={tdStyle}>
                          {new Date(
                            movement.created_at
                          ).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  fontFamily: "Arial, sans-serif",
  padding: "30px",
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "25px",
};

const subtitleStyle = {
  color: "#6b7280",
  marginTop: "6px",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "25px",
  marginBottom: "25px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.05)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const buttonRow = {
  marginTop: "25px",
};

const primaryButton = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "8px",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButton = {
  padding: "10px 18px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
};

const successBox = {
  background: "#dcfce7",
  color: "#166534",
  padding: "13px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const errorBox = {
  background: "#fee2e2",
  color: "#b91c1b",
  padding: "13px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "2px solid #e5e7eb",
  color: "#374151",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  color: "#4b5563",
  whiteSpace: "nowrap",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "20px",
  fontWeight: "600",
  fontSize: "13px",
};

export default Stock;