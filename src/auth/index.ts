import jwt, { Secret } from "jsonwebtoken";
const { JWT_SECRET } = process.env;

export const generateToken = (userId: string, username: string) =>
  jwt.sign(
    {
      userId,
      username,
    },
    JWT_SECRET as Secret,
    {
      expiresIn: "1h",
    }
  );
