import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, prospectsTable, messageTemplatesTable, messageStatusesTable, emailStepsTable } from "@workspace/db";
import { eq, and, max } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListProspectsParams,
  CreateProspectParams,
  CreateProspectBody,
  BulkCreateProspectsParams,
  BulkCreateProspectsBody,
  UpdateProspectParams,
  UpdateProspectBody,
  DeleteProspectParams,
  UpdateMessageStatusParams,
  UpdateMessageStatusBody,
  CreateEmailStepParams,
  CreateEmailStepBody,
  UpdateEmailStepParams,
  UpdateEmailStepBody,
  DeleteEmailStepParams,
} from "@workspace/api-zod";

const router = Router();

async function assertCardOwnership(cardId: number, userId: string) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)));
  return card;
}

async function getProspectWithStatuses(prospectId: number) {
  const [prospect] = await db.select().from(prospectsTable).where(eq(prospectsTable.id, prospectId));
  if (!prospect) return null;
  const statuses = await db.select().from(messageStatusesTable).where(eq(messageStatusesTable.prospectId, prospectId));
  const steps = await db.select().from(emailStepsTable).where(eq(emailStepsTable.prospectId, prospectId)).orderBy(emailStepsTable.order);
  return { ...prospect, messageStatuses: statuses, emailSteps: steps };
}

async function ensureMessageStatuses(prospectId: number, cardId: number) {
  const templates = await db.select().from(messageTemplatesTable).where(eq(messageTemplatesTable.cardId, cardId));
  const existing = await db.select().from(messageStatusesTable).where(eq(messageStatusesTable.prospectId, prospectId));
  const existingIds = new Set(existing.map((s) => s.messageTemplateId));
  for (const t of templates) {
    if (!existingIds.has(t.id)) {
      await db.insert(messageStatusesTable).values({ prospectId, messageTemplateId: t.id, done: false });
    }
  }
}

async function getNextRowNumber(cardId: number): Promise<number> {
  const result = await db.select({ maxRow: max(prospectsTable.rowNumber) }).from(prospectsTable).where(eq(prospectsTable.cardId, cardId));
  return (result[0]?.maxRow ?? 0) + 1;
}

router.get("/cards/:cardId/prospects", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = ListProspectsParams.parse({ cardId: Number(req.params.cardId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const prospects = await db.select().from(prospectsTable).where(eq(prospectsTable.cardId, cardId)).orderBy(prospectsTable.rowNumber);
  const results = await Promise.all(prospects.map(async (p) => {
    const statuses = await db.select().from(messageStatusesTable).where(eq(messageStatusesTable.prospectId, p.id));
    const steps = await db.select().from(emailStepsTable).where(eq(emailStepsTable.prospectId, p.id)).orderBy(emailStepsTable.order);
    return { ...p, messageStatuses: statuses, emailSteps: steps };
  }));
  res.json(results);
});

router.post("/cards/:cardId/prospects", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = CreateProspectParams.parse({ cardId: Number(req.params.cardId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = CreateProspectBody.parse(req.body);
  const rowNumber = await getNextRowNumber(cardId);
  const [prospect] = await db.insert(prospectsTable).values({ ...body, cardId, rowNumber }).returning();
  await ensureMessageStatuses(prospect.id, cardId);
  const result = await getProspectWithStatuses(prospect.id);
  res.status(201).json(result);
});

router.post("/cards/:cardId/prospects/bulk", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = BulkCreateProspectsParams.parse({ cardId: Number(req.params.cardId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = BulkCreateProspectsBody.parse(req.body);
  const results = [];
  let rowNumber = await getNextRowNumber(cardId);
  for (const row of body.rows) {
    const [prospect] = await db.insert(prospectsTable).values({ ...row, cardId, rowNumber }).returning();
    await ensureMessageStatuses(prospect.id, cardId);
    results.push(await getProspectWithStatuses(prospect.id));
    rowNumber++;
  }
  res.status(201).json(results);
});

router.patch("/cards/:cardId/prospects/:prospectId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId } = UpdateProspectParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = UpdateProspectBody.parse(req.body);
  const [prospect] = await db.update(prospectsTable).set(body).where(and(eq(prospectsTable.id, prospectId), eq(prospectsTable.cardId, cardId))).returning();
  if (!prospect) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await getProspectWithStatuses(prospectId));
});

router.delete("/cards/:cardId/prospects/:prospectId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId } = DeleteProspectParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  await db.delete(prospectsTable).where(and(eq(prospectsTable.id, prospectId), eq(prospectsTable.cardId, cardId)));
  res.status(204).send();
});

router.patch("/cards/:cardId/prospects/:prospectId/message-status", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId } = UpdateMessageStatusParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = UpdateMessageStatusBody.parse(req.body);
  const existing = await db.select().from(messageStatusesTable).where(and(eq(messageStatusesTable.prospectId, prospectId), eq(messageStatusesTable.messageTemplateId, body.messageTemplateId)));

  let status;
  if (existing.length > 0) {
    const [updated] = await db.update(messageStatusesTable).set({ done: body.done, doneAt: body.done ? new Date() : null }).where(eq(messageStatusesTable.id, existing[0].id)).returning();
    status = updated;
  } else {
    const [created] = await db.insert(messageStatusesTable).values({ prospectId, messageTemplateId: body.messageTemplateId, done: body.done, doneAt: body.done ? new Date() : null }).returning();
    status = created;
  }
  res.json(status);
});

router.post("/cards/:cardId/prospects/:prospectId/email-steps", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId } = CreateEmailStepParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = CreateEmailStepBody.parse(req.body);
  const existing = await db.select().from(emailStepsTable).where(eq(emailStepsTable.prospectId, prospectId));
  const order = existing.length + 1;
  const [step] = await db.insert(emailStepsTable).values({ prospectId, label: body.label, done: false, order }).returning();
  res.status(201).json(step);
});

router.patch("/cards/:cardId/prospects/:prospectId/email-steps/:stepId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId, stepId } = UpdateEmailStepParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId), stepId: Number(req.params.stepId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = UpdateEmailStepBody.parse(req.body);
  const [step] = await db.update(emailStepsTable).set(body).where(and(eq(emailStepsTable.id, stepId), eq(emailStepsTable.prospectId, prospectId))).returning();
  if (!step) { res.status(404).json({ error: "Step not found" }); return; }
  res.json(step);
});

router.delete("/cards/:cardId/prospects/:prospectId/email-steps/:stepId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, prospectId, stepId } = DeleteEmailStepParams.parse({ cardId: Number(req.params.cardId), prospectId: Number(req.params.prospectId), stepId: Number(req.params.stepId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  await db.delete(emailStepsTable).where(and(eq(emailStepsTable.id, stepId), eq(emailStepsTable.prospectId, prospectId)));
  res.status(204).send();
});

export default router;
