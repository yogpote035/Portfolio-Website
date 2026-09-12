import { sendError } from '../utils/apiResponse.js';

export function notFound(req, res) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

export function errorMiddleware(error, req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message;

  if (error.name === 'MulterError') {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file is too large'
        : 'Invalid file upload request';
  }

  if (process.env.NODE_ENV !== 'test') {
    const details = {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code: error.code,
      message,
    };
    if (statusCode >= 500) {
      console.error('Request failed', details, error);
    } else if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
      console.warn('Request rejected', details);
    }
  }

  return sendError(
    res,
    statusCode === 500 ? 'Internal server error' : message,
    statusCode,
    error.errors || null,
  );
}
