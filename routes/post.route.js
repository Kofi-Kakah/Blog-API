import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import {createPost,getPosts,category} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/posts", protectRoute, createPost);
router.get("/posts", getPosts);
router.get("/posts/category", category);

export default router;
