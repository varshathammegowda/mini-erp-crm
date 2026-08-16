import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Challans from "./pages/Challans";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard - all roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "SALES",
                "WAREHOUSE",
                "ACCOUNTS",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Customers - Admin, Sales, Accounts */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "SALES",
                "ACCOUNTS",
              ]}
            >
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* Products - Admin, Warehouse, Accounts */}
        <Route
          path="/products"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "WAREHOUSE",
                "ACCOUNTS",
              ]}
            >
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Stock - Admin, Warehouse */}
        <Route
          path="/stock"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "WAREHOUSE",
              ]}
            >
              <Stock />
            </ProtectedRoute>
          }
        />

        {/* Challans - Admin, Sales, Accounts */}
        <Route
          path="/challans"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "SALES",
                "ACCOUNTS",
              ]}
            >
              <Challans />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;