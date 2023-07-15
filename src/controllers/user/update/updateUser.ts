import { Request, Response } from 'express';
import updateUserValidation from './updateUserValidation';
import { User } from 'src/models';

const updateUser = async (req: Request, res: Response) => {
  const user = req.user;
  const newPassword = req.body.password;
  const validationError = await updateUserValidation(newPassword);
  if (validationError) {
    return res.validationError(validationError);
  }

  user.hash = User.generateHash(newPassword);
  user.updatedOn = new Date();
  await user.save();

  const userData = {
    user: {
      displayName: user.displayName,
      username: user.username,
      createdOn: user.createdOn,
      updatedOn: user.updatedOn,
    },
  };

  res.success('user password has been successfully updated', userData);
};

export default updateUser;
