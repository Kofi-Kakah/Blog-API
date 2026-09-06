import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { Signup, login, logout, getProfile } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.get("/profile/:userId", protectRoute, getProfile);

export default router;
