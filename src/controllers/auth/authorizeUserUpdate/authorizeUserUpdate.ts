import { NextFunction, Request, Response } from 'express';

const authorizeUserUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (req.requestedUser.username !== req.user.username) {
    return res.authorizationError('you do not have permission to perform this action');
  }
  next();
};

export default authorizeUserUpdate;
