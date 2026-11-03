import { Request, Response, NextFunction } from 'express';
import * as logger from '@/logger/index.js';

export function errorHandler() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.id || '-';
    // 保留正式服务既有的参数错误契约，不把无模型方向误报成服务故障。
    const status = err.status || (typeof err.message === 'string' && err.message.startsWith('No model found for ') ? 400 : 500);

    if (status === 401) {
      logger.warn(`[${requestId}] Unauthorized`);
    } else {
      logger.error(`[${requestId}] Unhandled Error: ${err.message}`, err);
    }

    if (res.headersSent) {
      return next(err);
    }

    if (status === 401) {
      res.status(401).json({ error: 'Unauthorized', requestId });
      return;
    }

    res.status(status === 400 ? 400 : 500).json({
      error: status === 400 ? 'Bad Request' : 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      requestId,
    });
  };
}
