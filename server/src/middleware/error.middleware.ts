import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`❌ [Error] ${req.method} ${req.url}:`, err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return sendError(res, 'A record with this unique value already exists', 409, 'DUPLICATE_ENTRY');
    }
    if (prismaErr.code === 'P2025') {
      return sendError(res, 'Record not found', 404, 'NOT_FOUND');
    }
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500,
    'INTERNAL_SERVER_ERROR'
  );
};
