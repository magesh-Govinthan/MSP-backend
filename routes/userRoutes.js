import express from "express";
import { forgotPw, login, register, resetPw } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.get("/login", login);
router.post("/forgot-password", forgotPw)
router.post("/reset-password/:token", resetPw);

export default router;
