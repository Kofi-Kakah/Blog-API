import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {followUser} from "../controllers/follow.controllers.js";


const router = express.Router();

router.post("/follow", protectRoute, followUser);

export default router;
