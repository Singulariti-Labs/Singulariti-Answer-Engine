import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (res: Response, req: Request) => {
  res.send("this is search route");
});

export default router;
