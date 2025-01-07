import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    role: Role;
}



export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ message: 'Internal server error. Secret key not provided.' });
            return;
        }
        const decoded = (jwt.verify(token, process.env.JWT_SECRET) as unknown) as JwtPayload;
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export const authorize = (roles: JwtPayload["role"][]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
             res.status(403).json({ message: 'Access denied. You do not have the required role.' });
             return;
        }
        next();
    };
};