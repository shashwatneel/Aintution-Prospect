import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { prospectsTable } from "./prospects";

export const emailStepsTable = pgTable("email_steps", {
  id: serial("id").primaryKey(),
  prospectId: integer("prospect_id").notNull().references(() => prospectsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  order: integer("order").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailStep = typeof emailStepsTable.$inferSelect;
