import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config/environement';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: isDevelopment ? err.stack : undefined
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
