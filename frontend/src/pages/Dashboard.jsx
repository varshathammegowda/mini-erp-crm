import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    challans: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const [
        customersResponse,
        productsResponse,
        challansResponse,
      ] = await Promise.all([
        axios.get(
          "https://mini-erp-crm-3-24mk.onrender.com/api/customers",
          config
        ),
        axios.get(
          "http://mini-erp-crm-3-24mk.onrender.com/api/products",
          config
        ),
        axios.get(
          "https://mini-erp-crm-3-24mk.onrender.com/api/challans",
          config
        ),
      ]);

      setStats({
        customers:
          customersResponse.data.customers?.length || 0,

        products:
          productsResponse.data.products?.length || 0,

        challans:
          challansResponse.data.challans?.length || 0,
      });
    } catch (error) {
      console.error("Dashboard loading error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#1f2937",
            }}
          >
            Mini ERP CRM
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#6b7280",
            }}
          >
            Business Management Dashboard
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <strong>{user?.name || "Admin User"}</strong>

            <div
              style={{
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              {user?.role || "ADMIN"}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              padding: "9px 16px",
              border: "none",
              borderRadius: "7px",
              background: "#ef4444",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          padding: "30px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
            color: "#1f2937",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Overview of your ERP and CRM system
        </p>

        {/* STATISTICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <DashboardCard
            title="Total Customers"
            value={stats.customers}
            onClick={() => navigate("/customers")}
          />

          <DashboardCard
            title="Total Products"
            value={stats.products}
            onClick={() => navigate("/products")}
          />

          <DashboardCard
            title="Total Challans"
            value={stats.challans}
            onClick={() => navigate("/challans")}
          />
        </div>

        {/* MODULES */}
        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            ERP Modules
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <ModuleCard
              title="👥 Customers"
              description="Manage customers and follow-ups."
              onClick={() => navigate("/customers")}
            />

            <ModuleCard
              title="📦 Products"
              description="Manage products and inventory."
              onClick={() => navigate("/products")}
            />

            <ModuleCard
              title="📊 Stock"
              description="Track stock IN and OUT movements."
              onClick={() => navigate("/stock")}
            />

            <ModuleCard
              title="🧾 Challans"
              description="Create and manage sales challans."
              onClick={() => navigate("/challans")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


/* ===============================
   DASHBOARD CARD
================================ */

function DashboardCard({
  title,
  value,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
    >
      <p style={{ color: "#6b7280" }}>
        {title}
      </p>

      <h2
        style={{
          fontSize: "32px",
          margin: 0,
          color: "#1f2937",
        }}
      >
        {value}
      </h2>
    </div>
  );
}


/* ===============================
   MODULE CARD
================================ */

function ModuleCard({
  title,
  description,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
    >
      <h3>{title}</h3>

      <p
        style={{
          color: "#6b7280",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default Dashboard;