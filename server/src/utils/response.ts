import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponse['meta']
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  code = 'INTERNAL_SERVER_ERROR',
  details?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    code,
    ...(details ? { data: details } : {}),
  };
  return res.status(statusCode).json(response);
};
