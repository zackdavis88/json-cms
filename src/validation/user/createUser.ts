import { NextFunction, Request, Response } from 'express';
import { validateUsername, validatePassword } from './utils';

const createUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usernameError = await validateUsername(req.body.username);
    if (usernameError) {
      return res.validationError(usernameError);
    }
  } catch (error) {
    return res.fatalError('fatal error while validating user create input');
  }

  const passwordError = await validatePassword(req.body.password);
  if (passwordError) {
    return res.validationError(passwordError);
  }

  next();
};

export default createUserValidation;
