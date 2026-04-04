import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!req.session.role || !roles.includes(req.session.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};
