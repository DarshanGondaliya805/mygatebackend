import { Response } from 'express';
import { convertDatesToIST } from './timezone';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const sendJson = (res: Response, statusCode: number, body: object): Response =>
  res.status(statusCode).type('json').end(JSON.stringify(convertDatesToIST(body)));

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const response: ApiResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return sendJson(res, statusCode, response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: any
): Response => {
  return sendJson(res, statusCode, {
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && error ? { error } : {}),
  });
};

export const sendCreated = <T>(res: Response, message: string, data?: T): Response =>
  sendSuccess(res, message, data, 201);

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response =>
  sendError(res, message, 401);

export const sendForbidden = (res: Response, message = 'Forbidden'): Response =>
  sendError(res, message, 403);

export const sendNotFound = (res: Response, message = 'Not found'): Response =>
  sendError(res, message, 404);

export const sendServerError = (res: Response, error?: any): Response =>
  sendError(res, 'Internal server error', 500, error);

export const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

export const getPaginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
