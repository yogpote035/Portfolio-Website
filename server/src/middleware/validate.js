export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    // Log a safe summary of the incoming payload for debugging. Avoid
    // printing sensitive values (tokens, passwords) — only show keys,
    // types and lengths where appropriate.
    try {
      const summarize = (obj) => {
        if (!obj || typeof obj !== 'object') return String(obj);
        return Object.keys(obj).reduce((acc, key) => {
          const val = obj[key];
          acc[key] = Array.isArray(val)
            ? `array(${val.length})`
            : typeof val === 'string'
              ? `string(${val.length})`
              : typeof val;
          return acc;
        }, {});
      };

      console.warn('[validate] Validation failed for', req.method, req.originalUrl, {
        body: summarize(req.body),
        params: summarize(req.params),
        query: summarize(req.query),
        issues: result.error.issues,
      });
    } catch (e) {
      // Swallow logging errors to avoid masking original validation error
    }

    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.errors = result.error.flatten();
    return next(error);
  }

  req.validated = result.data;
  return next();
};
