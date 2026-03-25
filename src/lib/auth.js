import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = '7d';

if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not defined');
}

export function generateToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
    if (!token) return null;

    try {
        return jwt.verify(token, SECRET_KEY);
    } catch {
        return null;
    }
}