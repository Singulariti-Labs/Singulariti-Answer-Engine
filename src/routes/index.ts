import express from "express";
import searchRouter from "./search";
import imagesRouter from "./images";
import configRouter from "./config";
import modelsRouter from "./models";

const router = express.Router();

router.use("/images", imagesRouter);
router.use("/config", configRouter);
router.use("/search", searchRouter);
router.use('/models', modelsRouter);

export default router;
