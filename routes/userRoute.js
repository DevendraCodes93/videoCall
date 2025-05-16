import express from "express";
import {
  checkAuth,
  login,
  logout,
  signUp,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-auth", authMiddleware, checkAuth);
export default router;
