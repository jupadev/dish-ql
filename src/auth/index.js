import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;

export const generateToken = (userId, username) =>
  jwt.sign(
    {
      userId,
      username,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
