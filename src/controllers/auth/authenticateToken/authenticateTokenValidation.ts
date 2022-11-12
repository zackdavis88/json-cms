import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { SECRET } from 'src/config/auth';

type JwtHeaderValidation = (header: string) => {
  validationError?: string;
  tokenData?: {
    id: string;
    apiKey: string;
  };
};

const jwtHeaderValidation: JwtHeaderValidation = (header) => {
  if (!header) {
    return { validationError: 'x-auth-token header is missing from input' };
  }

  try {
    const tokenData = jwt.verify(header, SECRET);
    if (typeof tokenData === 'string') {
      return { validationError: 'x-auth-token is invalid' };
    }

    const id = tokenData.id;
    const apiKey = tokenData.apiKey;

    if (!id || !apiKey) {
      return { validationError: 'x-auth-token is missing required fields' };
    }

    return { tokenData: { id, apiKey } };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { validationError: 'x-auth-token is expired' };
    }

    if (error instanceof JsonWebTokenError) {
      return { validationError: 'x-auth-token is invalid' };
    }

    throw error;
  }
};

export default jwtHeaderValidation;
