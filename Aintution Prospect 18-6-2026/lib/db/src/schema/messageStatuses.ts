import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { prospectsTable } from "./prospects";
import { messageTemplatesTable } from "./messageTemplates";

export const messageStatusesTable = pgTable("message_statuses", {
  id: serial("id").primaryKey(),
  prospectId: integer("prospect_id").notNull().references(() => prospectsTable.id, { onDelete: "cascade" }),
  messageTemplateId: integer("message_template_id").notNull().references(() => messageTemplatesTable.id, { onDelete: "cascade" }),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageStatusSchema = createInsertSchema(messageStatusesTable).omit({ id: true, createdAt: true });
export type InsertMessageStatus = z.infer<typeof insertMessageStatusSchema>;
export type MessageStatus = typeof messageStatusesTable.$inferSelect;
