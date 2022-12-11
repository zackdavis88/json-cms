import { Request, Response } from 'express';
import { BaseError, UniqueConstraintError } from 'sequelize';
import { User } from 'src/models';
import createUserValidation from './createUserValidation';

const create = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const validationError = await createUserValidation(username, password);
    if (validationError) {
      return res.validationError(validationError);
    }
  } catch (error) {
    return res.fatalError('fatal error while validating user create input');
  }

  try {
    const newUser = await User.create({
      username: username.toLowerCase(),
      displayName: username,
      hash: User.generateHash(password),
    });

    const userData = {
      user: {
        displayName: newUser.displayName,
        username: newUser.username,
        createdOn: newUser.createdOn,
      },
    };

    res.success('user has been successfully created', userData);
  } catch (error) {
    /*
      The user table has a unique constraint on username. There is a small
      chance that 2 requests could come in at the exact same time and both
      pass validation but one will ultimately fail when we try to write both
      records to the DB.
    */
    if (error instanceof UniqueConstraintError) {
      res.validationError('username is already taken');
    } else if (error instanceof BaseError) {
      res.fatalError('fatal error while creating user');
    }
  }
};

export default create;
