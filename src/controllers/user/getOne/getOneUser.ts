import { Request, Response, NextFunction } from 'express';
import { User } from 'src/models';
import getOneUserValidation from './getOneUserValidation';

export const getRequestedUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const username = req.params.username;
  try {
    const user = await getOneUserValidation(username);
    if (!(user instanceof User)) {
      return res.notFoundError(user);
    }

    req.requestedUser = user;
    next();
  } catch (error) {
    return res.fatalError('fatal error while getting user');
  }
};

const getOneUser = async (req: Request, res: Response) => {
  const requestedUser = req.requestedUser;
  const userData = {
    user: {
      displayName: requestedUser.displayName,
      username: requestedUser.username,
      createdOn: requestedUser.createdOn,
    },
  };

  res.success('user has been successfully retrieved', userData);
};

export default getOneUser;
