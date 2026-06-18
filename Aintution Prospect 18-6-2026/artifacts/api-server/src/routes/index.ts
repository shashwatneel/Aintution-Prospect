import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import cardsRouter from "./cards";
import messagesRouter from "./messages";
import prospectsRouter from "./prospects";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(cardsRouter);
router.use(messagesRouter);
router.use(prospectsRouter);
router.use(analyticsRouter);

export default router;
