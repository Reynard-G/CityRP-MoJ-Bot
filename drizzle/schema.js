const {
  mysqlTable,
  int,
  timestamp,
  smallint,
  varchar,
  decimal,
  customType,
} = require("drizzle-orm/mysql-core");

const customMediumBlob = customType({
  dataType() {
    return "mediumblob";
  },
});

const criminalEvidence = mysqlTable("criminalEvidence", {
  id: int("id").autoincrement().notNull(),
  indictment_id: int("indictment_id")
    .notNull()
    .references(() => criminalIndictments.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  attachment: customMediumBlob("attachment").notNull(),
  updated_at: timestamp("updated_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
  created_at: timestamp("created_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
});

const criminalIndictments = mysqlTable("criminalIndictments", {
  id: int("id").autoincrement().notNull(),
  criminal_id: smallint("criminal_id")
    .notNull()
    .references(() => criminals.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  officer_discord_id: varchar("officer_discord_id", { length: 24 }).notNull(),
  charges: varchar("charges", { length: 256 }).notNull(),
  jailTime: int("jailTime").notNull(),
  fine: decimal("fine", { precision: 64, scale: 2 }).notNull(),
  summary: varchar("summary", { length: 1024 }).default("NULL"),
  message_id: varchar("message_id", { length: 24 }).default("NULL"),
  updated_at: timestamp("updated_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
  created_at: timestamp("created_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
});

const criminals = mysqlTable("criminals", {
  id: smallint("id").autoincrement().notNull(),
  username: varchar("username", { length: 16 }).notNull(),
  thread_id: varchar("thread_id", { length: 24 }).notNull(),
  updated_at: timestamp("updated_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
  created_at: timestamp("created_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
});

module.exports = { criminalEvidence, criminalIndictments, criminals };
