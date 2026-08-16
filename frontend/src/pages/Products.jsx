import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

const emptyForm = {
  product_name: "",
  sku: "",
  category: "",
  unit_price: "",
  minimum_stock: "",
  warehouse: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/products`,
        getConfig()
      );

      setProducts(response.data.products || []);
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const data = {
        ...form,
        unit_price: Number(form.unit_price),
        minimum_stock: Number(form.minimum_stock),
      };

      if (editingId) {
        await axios.put(
          `${API}/products/${editingId}`,
          data,
          getConfig()
        );

        setMessage("Product updated successfully.");
      } else {
        await axios.post(
          `${API}/products`,
          data,
          getConfig()
        );

        setMessage("Product created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadProducts();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save product"
      );
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);

    setForm({
      product_name: product.product_name || "",
      sku: product.sku || "",
      category: product.category || "",
      unit_price: product.unit_price || "",
      minimum_stock: product.minimum_stock || "",
      warehouse: product.warehouse || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    return (
      product.product_name
        ?.toLowerCase()
        .includes(value) ||
      product.sku
        ?.toLowerCase()
        .includes(value) ||
      product.category
        ?.toLowerCase()
        .includes(value) ||
      product.warehouse
        ?.toLowerCase()
        .includes(value)
    );
  });

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Products & Inventory
            </h1>

            <p style={subtitleStyle}>
              Manage products, pricing and inventory
              information.
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

        {/* PRODUCT FORM */}

        <div style={cardStyle}>
          <h2>
            {editingId
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <p style={subtitleStyle}>
            Enter product details below.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={formGrid}>
              <Input
                label="Product Name *"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <Input
                label="SKU *"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
              />

              <Input
                label="Category *"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />

              <Input
                label="Unit Price *"
                name="unit_price"
                type="number"
                value={form.unit_price}
                onChange={handleChange}
                required
              />

              <Input
                label="Minimum Stock *"
                name="minimum_stock"
                type="number"
                value={form.minimum_stock}
                onChange={handleChange}
                required
              />

              <Input
                label="Warehouse *"
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                required
              />
            </div>

            <div style={buttonRow}>
              <button
                type="submit"
                style={primaryButton}
              >
                {editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={secondaryButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SEARCH */}

        <div style={cardStyle}>
          <h2>Search Products</h2>

          <input
            type="text"
            placeholder="Search product, SKU, category or warehouse..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        {/* PRODUCT TABLE */}

        <div style={cardStyle}>
          <h2>Product List</h2>

          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products found.</p>
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
                      Category
                    </th>

                    <th style={thStyle}>
                      Price
                    </th>

                    <th style={thStyle}>
                      Current Stock
                    </th>

                    <th style={thStyle}>
                      Minimum Stock
                    </th>

                    <th style={thStyle}>
                      Warehouse
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const currentStock =
                        Number(
                          product.current_stock
                        );

                      const minimumStock =
                        Number(
                          product.minimum_stock
                        );

                      const isLowStock =
                        currentStock <=
                        minimumStock;

                      return (
                        <tr key={product.id}>
                          <td style={tdStyle}>
                            {
                              product.product_name
                            }
                          </td>

                          <td style={tdStyle}>
                            {product.sku}
                          </td>

                          <td style={tdStyle}>
                            {product.category}
                          </td>

                          <td style={tdStyle}>
                            ₹
                            {Number(
                              product.unit_price
                            ).toFixed(2)}
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                ...stockBadge,
                                background:
                                  isLowStock
                                    ? "#fee2e2"
                                    : "#dcfce7",
                                color:
                                  isLowStock
                                    ? "#991b1b"
                                    : "#166534",
                              }}
                            >
                              {currentStock}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            {minimumStock}
                          </td>

                          <td style={tdStyle}>
                            {product.warehouse}
                          </td>

                          <td style={tdStyle}>
                            <button
                              onClick={() =>
                                editProduct(
                                  product
                                )
                              }
                              style={
                                smallButton
                              }
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ===============================
   INPUT
================================ */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        style={inputStyle}
      />
    </div>
  );
}


/* ===============================
   STYLES
================================ */

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
  display: "flex",
  gap: "10px",
  marginTop: "25px",
};

const primaryButton = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
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

const smallButton = {
  padding: "7px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "#ffffff",
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
  color: "#b91c1c",
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

const stockBadge = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "20px",
  fontWeight: "600",
  fontSize: "13px",
};

export default Products;