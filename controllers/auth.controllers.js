import bcrypt from "bcryptjs";
import { signToken } from "../libs/jwt.js";
import { prisma } from "../prisma.ts";

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
  comments: user.comments,
  likes: user.likes,
});


export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({ id: user.id, email: user.email });

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token");
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const authenticatedUserId = Number(req.user?.id);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!req.user || authenticatedUserId !== userId) {
      return res.status(403).json({ message: "You are not authenticated to view this profile." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        followers: true,
        following: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: sanitizeUser(user),
      posts: user.posts,
      followerCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

