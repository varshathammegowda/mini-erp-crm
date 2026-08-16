import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000/api";

const emptyForm = {
  customer_name: "",
  mobile: "",
  email: "",
  business_name: "",
  gst_number: "",
  customer_type: "Retail",
  address: "",
  status: "Lead",
  follow_up_date: "",
  notes: "",
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/customers`,
        getConfig()
      );

      setCustomers(response.data.customers || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
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
      setError("");
      setMessage("");

      if (editingId) {
        await axios.put(
          `${API}/customers/${editingId}`,
          form,
          getConfig()
        );

        setMessage("Customer updated successfully.");
      } else {
        await axios.post(
          `${API}/customers`,
          form,
          getConfig()
        );

        setMessage("Customer created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save customer"
      );
    }
  };

  const editCustomer = (customer) => {
    setEditingId(customer.id);

    setForm({
      customer_name: customer.customer_name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      business_name: customer.business_name || "",
      gst_number: customer.gst_number || "",
      customer_type: customer.customer_type || "Retail",
      address: customer.address || "",
      status: customer.status || "Lead",
      follow_up_date: customer.follow_up_date
        ? customer.follow_up_date.split("T")[0]
        : "",
      notes: customer.notes || "",
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

  const searchCustomers = async () => {
    if (!search.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/customers/search`,
        {
          ...getConfig(),
          params: {
            search: search.trim(),
          },
        }
      );

      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to search customers"
      );
    } finally {
      setLoading(false);
    }
  };

  const viewCustomer = async (id) => {
    try {
      const response = await axios.get(
        `${API}/customers/${id}`,
        getConfig()
      );

      setSelectedCustomer(response.data.customer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customer details"
      );
    }
  };

  const addFollowUp = async () => {
    if (!selectedCustomer || !followUpNote.trim()) {
      setError("Enter a follow-up note.");
      return;
    }

    try {
      await axios.post(
        `${API}/customers/${selectedCustomer.id}/followups`,
        {
          note: followUpNote,
          follow_up_date: followUpDate || null,
        },
        getConfig()
      );

      setFollowUpNote("");
      setFollowUpDate("");
      setMessage("Follow-up added successfully.");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add follow-up"
      );
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Customer CRM</h1>

            <p style={subtitleStyle}>
              Manage customers, search records, edit details
              and add follow-ups.
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

        {/* CUSTOMER FORM */}
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <div>
              <h2 style={{ margin: 0 }}>
                {editingId
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>

              <p style={subtitleStyle}>
                Enter the customer information below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formGrid}>
              <Input
                label="Customer Name *"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
              />

              <Input
                label="Mobile *"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Business Name *"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                required
              />

              <Input
                label="GST Number"
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
              />

              <div>
                <label style={labelStyle}>
                  Customer Type *
                </label>

                <select
                  name="customer_type"
                  value={form.customer_type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Retail">
                    Retail
                  </option>

                  <option value="Wholesale">
                    Wholesale
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <Input
                label="Follow-up Date"
                name="follow_up_date"
                type="date"
                value={form.follow_up_date}
                onChange={handleChange}
              />

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>
                  Address *
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={buttonRow}>
              <button
                type="submit"
                style={primaryButton}
              >
                {editingId
                  ? "Update Customer"
                  : "Add Customer"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={secondaryButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SEARCH */}
        <div style={cardStyle}>
          <h2>Search Customers</h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchCustomers();
                }
              }}
              placeholder="Search name, mobile, email or business..."
              style={{
                ...inputStyle,
                flex: 1,
                minWidth: "250px",
              }}
            />

            <button
              onClick={searchCustomers}
              style={primaryButton}
            >
              Search
            </button>

            <button
              onClick={() => {
                setSearch("");
                loadCustomers();
              }}
              style={secondaryButton}
            >
              Clear
            </button>
          </div>
        </div>

        {/* CUSTOMER LIST */}
        <div style={cardStyle}>
          <h2>Customers</h2>

          {loading ? (
            <p>Loading customers...</p>
          ) : customers.length === 0 ? (
            <p>No customers found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Mobile</th>
                    <th style={thStyle}>Business</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={tdStyle}>
                        {customer.customer_name}
                      </td>

                      <td style={tdStyle}>
                        {customer.mobile}
                      </td>

                      <td style={tdStyle}>
                        {customer.business_name}
                      </td>

                      <td style={tdStyle}>
                        {customer.customer_type}
                      </td>

                      <td style={tdStyle}>
                        <span style={statusBadge}>
                          {customer.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              viewCustomer(customer.id)
                            }
                            style={smallButton}
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              editCustomer(customer)
                            }
                            style={smallButton}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CUSTOMER DETAIL + FOLLOW-UP */}
        {selectedCustomer && (
          <div style={cardStyle}>
            <div style={sectionHeader}>
              <div>
                <h2 style={{ margin: 0 }}>
                  Customer Details
                </h2>

                <p style={subtitleStyle}>
                  {selectedCustomer.customer_name}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                style={secondaryButton}
              >
                Close
              </button>
            </div>

            <div style={detailsGrid}>
              <Detail
                label="Customer"
                value={
                  selectedCustomer.customer_name
                }
              />

              <Detail
                label="Mobile"
                value={selectedCustomer.mobile}
              />

              <Detail
                label="Email"
                value={selectedCustomer.email}
              />

              <Detail
                label="Business"
                value={
                  selectedCustomer.business_name
                }
              />

              <Detail
                label="GST"
                value={selectedCustomer.gst_number}
              />

              <Detail
                label="Type"
                value={
                  selectedCustomer.customer_type
                }
              />

              <Detail
                label="Status"
                value={selectedCustomer.status}
              />

              <Detail
                label="Address"
                value={selectedCustomer.address}
              />
            </div>

            <hr
              style={{
                margin: "30px 0",
                border: 0,
                borderTop:
                  "1px solid #e5e7eb",
              }}
            />

            <h3>Add Follow-up Note</h3>

            <div style={formGrid}>
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <label style={labelStyle}>
                  Note *
                </label>

                <textarea
                  value={followUpNote}
                  onChange={(e) =>
                    setFollowUpNote(
                      e.target.value
                    )
                  }
                  rows="4"
                  placeholder="Enter follow-up details..."
                  style={inputStyle}
                />
              </div>

              <Input
                label="Follow-up Date"
                type="date"
                value={followUpDate}
                onChange={(e) =>
                  setFollowUpDate(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              onClick={addFollowUp}
              style={primaryButton}
            >
              Add Follow-up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


/* ===============================
   REUSABLE INPUT
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
        style={inputStyle}
      />
    </div>
  );
}


/* ===============================
   DETAIL
================================ */

function Detail({ label, value }) {
  return (
    <div>
      <div
        style={{
          color: "#6b7280",
          fontSize: "13px",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          color: "#1f2937",
        }}
      >
        {value || "-"}
      </div>
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
  maxWidth: "1200px",
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

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "20px",
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
};

const statusBadge = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "20px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "13px",
  fontWeight: "600",
};

export default Customers;