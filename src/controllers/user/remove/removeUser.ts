import { Request, Response } from 'express';
import removeUserValidation from './removeUserValidation';

const removeUser = async (req: Request, res: Response) => {
  const user = req.user;
  const confirm = req.body.confirm;
  const validationError = removeUserValidation(confirm, user.username);
  if (validationError) {
    return res.validationError(validationError);
  }

  user.isActive = false;
  user.deletedOn = new Date();
  await user.save();

  const userData = {
    user: {
      displayName: user.displayName,
      username: user.username,
      createdOn: user.createdOn,
      deletedOn: user.deletedOn,
    },
  };

  res.success('user has been successfully removed', userData);
};

export default removeUser;
