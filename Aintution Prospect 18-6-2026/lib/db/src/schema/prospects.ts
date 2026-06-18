import { pgTable, serial, integer, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cardsTable } from "./cards";

export const prospectsTable = pgTable("prospects", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull().references(() => cardsTable.id, { onDelete: "cascade" }),
  rowNumber: integer("row_number").notNull().default(1),
  name: varchar("name", { length: 255 }).notNull(),
  email: text("email"),
  linkedin: text("linkedin"),
  status: varchar("status", { length: 50 }).notNull().default("not_send"),
  leadDone: boolean("lead_done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProspectSchema = createInsertSchema(prospectsTable).omit({ id: true, createdAt: true });
export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospectsTable.$inferSelect;
