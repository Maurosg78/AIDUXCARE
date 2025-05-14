import { z, ZodTypeAny } from 'zod';

export const validateBody = <T extends ZodTypeAny>(schema: T) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid body', errors: result.error.format() });
      return;
    }
    req.body = result.data;
    next();
  };

export const validateQuery = <T extends ZodTypeAny>(schema: T) =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid query', errors: result.error.format() });
      return;
    }
    req.query = result.data;
    next();
  };

export const validateParams = <T extends ZodTypeAny>(schema: T) =>
  (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid params', errors: result.error.format() });
      return;
    }
    req.params = result.data;
    next();
  };

export { z, ZodTypeAny };
