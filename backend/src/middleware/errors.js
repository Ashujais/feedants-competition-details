export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status ?? (error.name === 'CastError' ? 400 : 500);
  const code = error.code && typeof error.code === 'string' ? error.code : status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST';
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: {
      code,
      message: status >= 500 ? 'Something went wrong' : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
