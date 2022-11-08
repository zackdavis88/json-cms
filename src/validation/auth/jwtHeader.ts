import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { SECRET } from 'src/config/auth';

export const jwtHeaderValidation = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['x-auth-token']
    ? req.headers['x-auth-token'].toString()
    : '';

  if (!header) {
    return res.validationError('x-auth-token header is missing from input');
  }

  try {
    const tokenData = jwt.verify(header, SECRET);
    if (typeof tokenData === 'string') {
      return res.validationError('x-auth-token is invalid');
    }

    const id = tokenData.id;
    const apiKey = tokenData.apiKey;

    if (!id || !apiKey) {
      return res.validationError('x-auth-token is missing required fields');
    }

    req.tokenData = { id, apiKey };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.validationError('x-auth-token is expired');
    }

    if (error instanceof JsonWebTokenError) {
      return res.validationError('x-auth-token is invalid');
    }
  }
};
