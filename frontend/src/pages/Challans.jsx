import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

function Challans() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("Draft");

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // PAGINATION + SEARCH
  // ========================================

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // ========================================
  // LOAD CUSTOMERS + PRODUCTS
  // ========================================

  const loadFormData = async () => {
    try {
      const [
        customersResponse,
        productsResponse,
      ] = await Promise.all([
        axios.get(
          `${API}/customers`,
          getConfig()
        ),
        axios.get(
          `${API}/products`,
          getConfig()
        ),
      ]);

      setCustomers(
        customersResponse.data.customers || []
      );

      setProducts(
        productsResponse.data.products || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers and products"
      );
    }
  };

  // ========================================
  // LOAD CHALLANS
  // ========================================

  const loadChallans = async (
    selectedPage = page,
    selectedSearch = search
  ) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/challans`,
        {
          ...getConfig(),
          params: {
            page: selectedPage,
            limit,
            search: selectedSearch,
          },
        }
      );

      setChallans(
        response.data.challans || []
      );

      setPagination(
        response.data.pagination || {
          page: selectedPage,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load challans"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    loadChallans(page, search);
  }, [page, search]);

  // ========================================
  // ITEM FUNCTIONS
  // ========================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const resetForm = () => {
    setCustomerId("");
    setStatus("Draft");

    setItems([
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };

  // ========================================
  // CREATE CHALLAN
  // ========================================

  const createChallan = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!customerId) {
      setError(
        "Please select a customer."
      );
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.product_id &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setError(
        "Please add at least one valid product."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        `${API}/challans`,
        {
          customer_id: Number(customerId),
          status,
          items: validItems.map(
            (item) => ({
              product_id: Number(
                item.product_id
              ),
              quantity: Number(
                item.quantity
              ),
            })
          ),
        },
        getConfig()
      );

      setMessage(
        response.data.message ||
          "Challan created successfully."
      );

      resetForm();

      // Return to first page so the
      // newly-created challan is visible.
      setPage(1);

      await loadChallans(1, search);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create challan"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // CANCEL CHALLAN
  // ========================================

  const cancelChallan = async (
    challan
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel ${challan.challan_number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(challan.id);
      setMessage("");
      setError("");

      const response = await axios.patch(
        `${API}/challans/${challan.id}/cancel`,
        {},
        getConfig()
      );

      setMessage(
        response.data.message ||
          "Challan cancelled successfully."
      );

      await loadChallans(
        page,
        search
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to cancel challan"
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ========================================
  // SEARCH
  // ========================================

  const handleSearchChange = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  // ========================================
  // PAGINATION
  // ========================================

  const goToPreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPage((currentPage) =>
        currentPage - 1
      );
    }
  };

  const goToNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((currentPage) =>
        currentPage + 1
      );
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Sales Challans
            </h1>

            <p style={subtitleStyle}>
              Create, confirm and manage
              sales challans.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.href =
                "/dashboard")
            }
            style={secondaryButton}
          >
            ← Dashboard
          </button>
        </div>

        {/* MESSAGE */}

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

        {/* CREATE CHALLAN */}

        <div style={cardStyle}>
          <h2>Create Sales Challan</h2>

          <p style={subtitleStyle}>
            Select a customer and add one or
            more products.
          </p>

          <form onSubmit={createChallan}>

            <div style={formGrid}>

              <div>
                <label style={labelStyle}>
                  Customer *
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                  required
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {
                          customer.customer_name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Status *
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>
                </select>
              </div>

            </div>

            {/* PRODUCTS */}

            <div
              style={{
                marginTop: "30px",
              }}
            >
              <h3>Products</h3>

              {items.map(
                (item, index) => (
                  <div
                    key={index}
                    style={itemRow}
                  >

                    <div
                      style={{
                        flex: 2,
                      }}
                    >
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Product
                      </label>

                      <select
                        value={
                          item.product_id
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "product_id",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                        required
                      >
                        <option value="">
                          Select Product
                        </option>

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.product_name
                              }{" "}
                              —{" "}
                              {
                                product.sku
                              }{" "}
                              — Stock:{" "}
                              {
                                product.current_stock
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      style={{
                        width: "150px",
                      }}
                    >
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          item.quantity
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target
                              .value
                          )
                        }
                        style={
                          inputStyle
                        }
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      style={
                        removeButton
                      }
                    >
                      Remove
                    </button>

                  </div>
                )
              )}

              <button
                type="button"
                onClick={addItem}
                style={
                  secondaryButton
                }
              >
                + Add Product
              </button>
            </div>

            {/* CREATE BUTTONS */}

            <div style={buttonRow}>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButton,
                  opacity: saving
                    ? 0.6
                    : 1,
                }}
              >
                {saving
                  ? "Creating..."
                  : status ===
                    "Confirmed"
                  ? "Create & Confirm Challan"
                  : "Create Draft Challan"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={
                  secondaryButton
                }
              >
                Clear
              </button>

            </div>

          </form>
        </div>

        {/* CHALLAN HISTORY */}

        <div style={cardStyle}>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Challan History
              </h2>

              <p
                style={{
                  ...subtitleStyle,
                  marginBottom: 0,
                }}
              >
                Search and manage sales
                challans.
              </p>
            </div>

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search challan, customer or status..."
              value={search}
              onChange={
                handleSearchChange
              }
              style={{
                ...inputStyle,
                maxWidth: "350px",
              }}
            />
          </div>

          {/* TABLE */}

          {loading ? (
            <p>
              Loading challans...
            </p>
          ) : challans.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#6b7280",
              }}
            >
              No challans found.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={tableStyle}
              >
                <thead>
                  <tr>

                    <th style={thStyle}>
                      Challan
                    </th>

                    <th style={thStyle}>
                      Customer
                    </th>

                    <th style={thStyle}>
                      Quantity
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Created By
                    </th>

                    <th style={thStyle}>
                      Created At
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {challans.map(
                    (challan) => (
                      <tr
                        key={
                          challan.id
                        }
                      >

                        <td
                          style={{
                            ...tdStyle,
                            fontWeight:
                              "bold",
                          }}
                        >
                          {
                            challan.challan_number
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            challan.customer_name
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            challan.total_quantity
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <span
                            style={{
                              ...statusBadge,
                              background:
                                getStatusBackground(
                                  challan.status
                                ),
                              color:
                                getStatusColor(
                                  challan.status
                                ),
                            }}
                          >
                            {
                              challan.status
                            }
                          </span>
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            challan.created_by_name
                          }
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {new Date(
                            challan.created_at
                          ).toLocaleString()}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >

                          {challan.status !==
                            "Cancelled" && (
                            <button
                              type="button"
                              onClick={() =>
                                cancelChallan(
                                  challan
                                )
                              }
                              disabled={
                                cancellingId ===
                                challan.id
                              }
                              style={{
                                ...cancelButton,
                                opacity:
                                  cancellingId ===
                                  challan.id
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {cancellingId ===
                              challan.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          )}

                          {challan.status ===
                            "Cancelled" && (
                            <span
                              style={{
                                color:
                                  "#6b7280",
                                fontSize:
                                  "13px",
                              }}
                            >
                              Cancelled
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}

          {!loading &&
            pagination.totalPages > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "25px",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >

                <span
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  Showing page{" "}
                  {pagination.page} of{" "}
                  {
                    pagination.totalPages
                  }{" "}
                  — Total:{" "}
                  {pagination.total}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      goToPreviousPage
                    }
                    disabled={
                      !pagination.hasPreviousPage
                    }
                    style={{
                      ...secondaryButton,
                      opacity:
                        pagination.hasPreviousPage
                          ? 1
                          : 0.5,
                    }}
                  >
                    ← Previous
                  </button>

                  <span
                    style={{
                      padding:
                        "10px 15px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius:
                        "8px",
                      background:
                        "#f9fafb",
                    }}
                  >
                    {pagination.page}
                  </span>

                  <button
                    type="button"
                    onClick={
                      goToNextPage
                    }
                    disabled={
                      !pagination.hasNextPage
                    }
                    style={{
                      ...secondaryButton,
                      opacity:
                        pagination.hasNextPage
                          ? 1
                          : 0.5,
                    }}
                  >
                    Next →
                  </button>

                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}

// ========================================
// HELPERS
// ========================================

function getStatusBackground(
  status
) {
  if (status === "Confirmed") {
    return "#dcfce7";
  }

  if (status === "Cancelled") {
    return "#fee2e2";
  }

  return "#fef3c7";
}

function getStatusColor(status) {
  if (status === "Confirmed") {
    return "#166534";
  }

  if (status === "Cancelled") {
    return "#991b1b";
  }

  return "#92400e";
}

// ========================================
// STYLES
// ========================================

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
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const itemRow = {
  display: "flex",
  alignItems: "end",
  gap: "15px",
  marginBottom: "18px",
  flexWrap: "wrap",
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
  border:
    "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const buttonRow = {
  display: "flex",
  gap: "10px",
  marginTop: "30px",
  flexWrap: "wrap",
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
  border:
    "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
};

const removeButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#ef4444",
  color: "#ffffff",
  cursor: "pointer",
};

const cancelButton = {
  padding: "7px 12px",
  border: "none",
  borderRadius: "6px",
  background: "#dc2626",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
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
  borderBottom:
    "2px solid #e5e7eb",
  color: "#374151",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  borderBottom:
    "1px solid #e5e7eb",
  color: "#4b5563",
  whiteSpace: "nowrap",
};

const statusBadge = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "20px",
  fontWeight: "600",
  fontSize: "13px",
};

export default Challans;