import { Router } from "express";
import { db } from "@workspace/db";
import { cardsTable, messageTemplatesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { CreateCardBody, UpdateCardBody, UpdateCardParams, DeleteCardParams, GetCardParams } from "@workspace/api-zod";

const router = Router();

router.get("/cards", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.userId, userId))
    .orderBy(cardsTable.createdAt);
  res.json(cards);
});

router.post("/cards", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const body = CreateCardBody.parse(req.body);
  const [card] = await db
    .insert(cardsTable)
    .values({ ...body, userId })
    .returning();

  await db.insert(messageTemplatesTable).values({
    cardId: card.id,
    label: "Default Message",
    content: "Good Morning #name",
    order: 0,
    isDefault: true,
  });

  res.status(201).json(card);
});

router.get("/cards/:cardId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = GetCardParams.parse({ cardId: Number(req.params.cardId) });
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)));

  if (!card) { res.status(404).json({ error: "Not found" }); return; }
  res.json(card);
});

router.patch("/cards/:cardId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = UpdateCardParams.parse({ cardId: Number(req.params.cardId) });
  const body = UpdateCardBody.parse(req.body);

  const [card] = await db
    .update(cardsTable)
    .set(body)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)))
    .returning();

  if (!card) { res.status(404).json({ error: "Not found" }); return; }
  res.json(card);
});

router.delete("/cards/:cardId", requireAuth, async (req, res): Promise<void> => {
  const userId = String(req.session.userId!);
  const { cardId } = DeleteCardParams.parse({ cardId: Number(req.params.cardId) });
  await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, cardId), eq(cardsTable.userId, userId)));
  res.status(204).send();
});

export default router;
