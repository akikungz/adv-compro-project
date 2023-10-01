import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export const generateToken = (id: string) => jwt.sign({ id }, secret!, { expiresIn: "30d" });

export const getIdFromToken = (token: string) => jwt.verify(token.split(" ")[1], secret!) as { id: string };