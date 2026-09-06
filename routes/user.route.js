import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { comment, likes,} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/comment", protectRoute, comment);
router.post("/like", protectRoute, likes);

export default router;
