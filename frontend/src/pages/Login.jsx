import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
            color: "#1f2937",
          }}
        >
          Mini ERP CRM
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Admin Login
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "25px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;