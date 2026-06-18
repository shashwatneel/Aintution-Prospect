import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, messageTemplatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListMessagesParams,
  CreateMessageParams,
  CreateMessageBody,
  UpdateMessageParams,
  UpdateMessageBody,
  DeleteMessageParams,
} from "@workspace/api-zod";

const router = Router();

async function assertCardOwnership(cardId: number, userId: string) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)));
  return card;
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

router.get("/cards/:cardId/messages", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = ListMessagesParams.parse({ cardId: Number(req.params.cardId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const templates = await db
    .select()
    .from(messageTemplatesTable)
    .where(eq(messageTemplatesTable.cardId, cardId))
    .orderBy(messageTemplatesTable.order);

  res.json(templates);
});

router.post("/cards/:cardId/messages", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = CreateMessageParams.parse({ cardId: Number(req.params.cardId) });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = CreateMessageBody.parse(req.body);
  const existing = await db
    .select()
    .from(messageTemplatesTable)
    .where(eq(messageTemplatesTable.cardId, cardId));

  const nonDefault = existing.filter((t) => !t.isDefault);
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((t) => t.order)) : -1;
  const msgNum = nonDefault.length + 1;
  const label = body.label || `${msgNum}${getOrdinalSuffix(msgNum)} Message`;

  const [template] = await db
    .insert(messageTemplatesTable)
    .values({ cardId, label, content: body.content || "", order: maxOrder + 1, daysFromPrev: body.daysFromPrev ?? null, isDefault: false })
    .returning();

  res.status(201).json(template);
});

router.patch("/cards/:cardId/messages/:messageId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, messageId } = UpdateMessageParams.parse({
    cardId: Number(req.params.cardId),
    messageId: Number(req.params.messageId),
  });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  const body = UpdateMessageBody.parse(req.body);
  const updateData: Record<string, unknown> = {};
  if (body.label !== undefined) updateData.label = body.label;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.daysFromPrev !== undefined) updateData.daysFromPrev = body.daysFromPrev;

  const [template] = await db
    .update(messageTemplatesTable)
    .set(updateData)
    .where(and(eq(messageTemplatesTable.id, messageId), eq(messageTemplatesTable.cardId, cardId)))
    .returning();

  if (!template) { res.status(404).json({ error: "Not found" }); return; }
  res.json(template);
});

router.delete("/cards/:cardId/messages/:messageId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId, messageId } = DeleteMessageParams.parse({
    cardId: Number(req.params.cardId),
    messageId: Number(req.params.messageId),
  });
  const card = await assertCardOwnership(cardId, userId);
  if (!card) { res.status(404).json({ error: "Card not found" }); return; }

  await db
    .delete(messageTemplatesTable)
    .where(and(eq(messageTemplatesTable.id, messageId), eq(messageTemplatesTable.cardId, cardId)));
  res.status(204).send();
});

export default router;
