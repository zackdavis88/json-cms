import { Request, Response } from 'express';
import { User } from 'src/models';
import getOneUserValidation from './getOneUserValidation';

const getOneUser = async (req: Request, res: Response) => {
  const username = req.params.username;
  try {
    const user = await getOneUserValidation(username);
    if (!(user instanceof User)) {
      return res.notFoundError(user);
    }

    const userData = {
      user: {
        displayName: user.displayName,
        username: user.username,
        createdOn: user.createdOn,
      },
    };

    res.success('user has been successfully retrieved', userData);
  } catch (error) {
    return res.fatalError('fatal error while getting user');
  }
};

export default getOneUser;
