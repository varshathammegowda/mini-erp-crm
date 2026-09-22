# Mini ERP & CRM

A full-stack **Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM)** application designed to manage customers, products, inventory, stock movements, and challans from a centralized dashboard.

## 🚀 Features

* 🔐 User authentication and login
* 👥 Role-based access control
* 📊 Dashboard
* 👤 Customer management
* 📦 Product management
* 🏭 Inventory and stock management
* 🔄 Stock movement tracking
* 🧾 Challan management
* 🔎 Search and data management
* 🛡️ Protected routes
* ⚡ REST API based architecture

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* Authentication & Middleware

### Database

* PostgreSQL

## 📁 Project Structure

```text
MINI-ERP-CRM/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Stock.jsx
│   │   │   ├── Challans.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── backend/
    ├── src/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── package.json
    └── ...
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <GITHUB-REPOSITORY-URL>
cd MINI-ERP-CRM
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

Add the required database and authentication configuration used by the backend.

## ▶️ Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The Vite development server will provide the frontend URL in the terminal.

## 🔄 Application Flow

```text
User
  ↓
React Frontend
  ↓
Axios / REST API
  ↓
Express Backend
  ↓
Middleware / Authentication
  ↓
Controllers
  ↓
PostgreSQL Database
  ↓
Response
  ↓
React Frontend
```

## 🔐 Authentication & Authorization

The application includes authentication and protected routes.

Users are given appropriate access based on their roles. Middleware is used to verify authentication and control access to protected resources.

## 📦 Main Modules

### Dashboard

Provides an overview of the application's important information.

### Customers

Manage customer information and customer-related records.

### Products

Create, view, update, and manage product information.

### Stock

Track inventory and stock-related operations.

### Challans

Create and manage challans and their associated items.

## 🧪 Testing

Before deployment, test:

* Login and authentication
* Protected routes
* Role-based access
* Customer CRUD operations
* Product CRUD operations
* Stock operations
* Challan operations
* API error handling
* Frontend responsiveness

## 🌐 Deployment

The application can be deployed using separate hosting services for the frontend, backend, and PostgreSQL database.

```text
React + Vite
     ↓
Frontend Hosting

Node + Express
     ↓
Backend Hosting

PostgreSQL
     ↓
Cloud Database
```

Production environment variables should be configured through the hosting platform rather than committed to GitHub.

## 🔒 Security

* Never commit passwords, API keys, JWT secrets, or database credentials.
* Store sensitive configuration in environment variables.
* Use protected routes for authenticated users.
* Validate incoming data on the backend.
* Use appropriate authorization checks for different user roles.

## 📌 Future Improvements

* Advanced reporting and analytics
* Export reports to PDF/Excel
* Email notifications
* Improved dashboard charts
* Advanced search and filtering
* Audit logs
* Automated testing
* Production monitoring

## 👩‍💻 Project Status

**Status: Completed**

The core ERP & CRM functionality has been implemented. The next stage is **GitHub setup, production configuration, deployment, and final testing**.

---
## 🚀 Live Demo

- 🌐 **Frontend:** https://mini-erp-crm-virid.vercel.app/
- ⚙️ **Backend API:** https://mini-erp-crm-3-24mk.onrender.com

  

## 📄 License

This project is created for educational and portfolio purposes.
