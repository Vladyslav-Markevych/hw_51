import { Router } from "express";
import { registerNewUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/api/register", registerNewUser);

export default router;
