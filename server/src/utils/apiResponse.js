export function sendSuccess(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res, message, statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
