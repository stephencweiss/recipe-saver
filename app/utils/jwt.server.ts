import { User } from '@prisma/client';
import { json } from '@remix-run/node';
import jwt from 'jsonwebtoken';
import invariant from 'tiny-invariant';

import { isValidString } from './strings';

invariant(isValidString(process.env.JWT_SECRET), "JWT_SECRET must be set");
const jwtSecret = process.env.JWT_SECRET;

export type UserToken = Pick<User, "id">;

const constructToken = (id: User["id"]): UserToken => {
  return { id };
}

export function createJWT(user: Pick<User,"id">) {
  return jwt.sign(constructToken(user.id), jwtSecret, { expiresIn: '1h' });
}

export function verifyJWT(token: string) {
  return jwt.verify(token, jwtSecret) as UserToken;
}

/** Middleware to put in place to require a valid JWT for an endpoint */
export const requireJWT = (request: Request): UserToken => {
  const authHeader = request.headers.get("Authorization")
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    throw json({ error: "Invalid token" }, { status: 401 });
  }
  const verified = verifyJWT(token)
  if (!verified) {
    throw json({ error: "Invalid token" }, { status: 401 });
  }
  return verified
}