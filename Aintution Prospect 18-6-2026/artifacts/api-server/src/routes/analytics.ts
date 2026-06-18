import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, prospectsTable, messageTemplatesTable, messageStatusesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/analytics", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const cards = await db.select().from(cardsTable).where(eq(cardsTable.userId, userId));

  const cardAnalytics = await Promise.all(cards.map(async (card) => {
    const prospects = await db.select().from(prospectsTable).where(eq(prospectsTable.cardId, card.id));
    const statusCounts = { not_send: 0, send: 0, accept: 0, reject: 0 };
    let leadDoneCount = 0;
    for (const p of prospects) {
      const s = p.status as keyof typeof statusCounts;
      if (s in statusCounts) statusCounts[s]++;
      if (p.leadDone) leadDoneCount++;
    }

    const templates = await db.select().from(messageTemplatesTable).where(eq(messageTemplatesTable.cardId, card.id)).orderBy(messageTemplatesTable.order);
    const messageCounts = await Promise.all(templates.map(async (t) => {
      const done = await db.select().from(messageStatusesTable).where(and(eq(messageStatusesTable.messageTemplateId, t.id), eq(messageStatusesTable.done, true)));
      return { messageId: t.id, label: t.label, doneCount: done.length };
    }));

    const today = new Date();
    let overdueCount = 0, dueTodayCount = 0;
    for (const prospect of prospects) {
      const statuses = await db.select().from(messageStatusesTable).where(eq(messageStatusesTable.prospectId, prospect.id));
      for (let i = 1; i < templates.length; i++) {
        const t = templates[i];
        if (!t.daysFromPrev) continue;
        const status = statuses.find((s) => s.messageTemplateId === t.id);
        if (status?.done) continue;
        const prevStatus = statuses.find((s) => s.messageTemplateId === templates[i - 1].id);
        if (!prevStatus?.done || !prevStatus.doneAt) continue;
        const dueDate = new Date(prevStatus.doneAt);
        dueDate.setDate(dueDate.getDate() + t.daysFromPrev);
        const diff = Math.floor((dueDate.getTime() - today.getTime()) / 86400000);
        if (diff < 0) overdueCount++;
        else if (diff === 0) dueTodayCount++;
      }
    }

    return { cardId: card.id, cardName: card.name, totalProspects: prospects.length, statusCounts, messageCounts, overdueCount, dueTodayCount, leadDoneCount };
  }));

  res.json({
    cards: cardAnalytics,
    totalProspects: cardAnalytics.reduce((s, c) => s + c.totalProspects, 0),
    totalAccepted: cardAnalytics.reduce((s, c) => s + c.statusCounts.accept, 0),
    totalRejected: cardAnalytics.reduce((s, c) => s + c.statusCounts.reject, 0),
  });
});

router.get("/analytics/export-csv", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const cards = await db.select().from(cardsTable).where(eq(cardsTable.userId, userId));
  const rows: string[] = ["Card,No,Name,Email,LinkedIn,Status,Lead Done,Messages..."];

  for (const card of cards) {
    const prospects = await db.select().from(prospectsTable).where(eq(prospectsTable.cardId, card.id)).orderBy(prospectsTable.rowNumber);
    const templates = await db.select().from(messageTemplatesTable).where(eq(messageTemplatesTable.cardId, card.id)).orderBy(messageTemplatesTable.order);
    for (const p of prospects) {
      const statuses = await db.select().from(messageStatusesTable).where(eq(messageStatusesTable.prospectId, p.id));
      const msgCols = templates.map((t) => (statuses.find((s) => s.messageTemplateId === t.id)?.done ? "Done" : "Pending"));
      rows.push([`"${card.name}"`, p.rowNumber, `"${p.name}"`, `"${p.email ?? ""}"`, `"${p.linkedin ?? ""}"`, p.status, p.leadDone ? "Yes" : "No", ...msgCols].join(","));
    }
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="aintution-prospects.csv"');
  res.send(rows.join("\n"));
});

export default router;
