import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import type { UserDocument } from "@/lib/models";

const TOKEN_TTL = "2h";
const REFRESH_TTL = "14d";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const issueTokens = (user: UserDocument | { _id: any; role: string }) => {
  const userId = (user as any)._id?.toString() || (user as any).id;
  const payload = { sub: userId, role: user.role };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
  const refresh = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
  return { token, refresh };
};

export const decodeToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: string;
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
};

export const decodeRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      sub: string;
      role: string;
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
};

export const refreshAccessToken = (refreshToken: string) => {
  const payload = decodeRefreshToken(refreshToken);
  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  const newToken = jwt.sign(
    { sub: payload.sub, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

  return newToken;
};

