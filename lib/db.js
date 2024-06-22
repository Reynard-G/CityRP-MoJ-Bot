const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const schema = require("../drizzle/schema");

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const db = drizzle(poolConnection, { schema, mode: "default", logger: true });
module.exports = db;
