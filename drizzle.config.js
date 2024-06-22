/** @type { import("drizzle-kit").Config } */
export default {
  dialect: "mysql",
  schema: "./drizzle/schema.js",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
};
