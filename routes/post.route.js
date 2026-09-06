import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {createPost,getPosts,} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/posts", protectRoute, createPost);
router.get("/posts", getPosts);

export default router;
