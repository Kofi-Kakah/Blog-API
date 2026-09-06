import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (payload) =>jwt.sign(payload, JWT_SECRET, {expiresIn: "1d"});

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
