import jwt from 'jsonwebtoken';

export function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
