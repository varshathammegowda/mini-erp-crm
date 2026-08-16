import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "./config/database";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@erp.com",
    password: "Admin@123",
    role: "ADMIN",
  },
  {
    name: "Sales User",
    email: "sales@erp.com",
    password: "Sales@123",
    role: "SALES",
  },
  {
    name: "Warehouse User",
    email: "warehouse@erp.com",
    password: "Warehouse@123",
    role: "WAREHOUSE",
  },
  {
    name: "Accounts User",
    email: "accounts@erp.com",
    password: "Accounts@123",
    role: "ACCOUNTS",
  },
];

const seedUsers = async () => {
  try {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await pool.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
        `,
        [user.name, user.email, hashedPassword, user.role]
      );
    }

    console.log("Users seeded successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await pool.end();
  }
};

seedUsers();