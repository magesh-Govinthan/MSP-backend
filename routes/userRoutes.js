import express from "express";
import { deleteUser, forgotPw, getAllUsers, login, register, resetPw, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.get("/login", login);
router.get('/getallusers', getAllUsers)
router.post("/forgot-password", forgotPw)
router.post("/reset-password/:token", resetPw);
router.put("/update/:id", updateUser)
router.delete("/delete/:id",deleteUser)

export default router;
