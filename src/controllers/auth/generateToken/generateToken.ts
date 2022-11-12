import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BaseError } from 'sequelize';
import { User } from 'src/models';
import { SECRET } from 'src/config/auth';
import generateTokenValidation from './generateTokenValidation';

const generateToken = async (req: Request, res: Response) => {
  const header = req.headers['x-auth-basic']
    ? req.headers['x-auth-basic'].toString()
    : '';

  const { validationError, credentials } = generateTokenValidation(header);
  if (validationError) {
    return res.validationError(validationError);
  }

  const { username = '', password = '' } = credentials || {};

  try {
    const user = await User.findOne({
      where: {
        username: username.toLowerCase(),
        isActive: true,
      },
    });

    if (!user) {
      return res.authenticationError('username and password combination is invalid');
    }

    if (!user.compareHash(password)) {
      return res.authenticationError('username and password combination is invalid');
    }

    const tokenData = {
      id: user.id,
      apiKey: user.apiKey,
    };

    const jwtOptions = { expiresIn: '10h' };
    const token = jwt.sign(tokenData, SECRET, jwtOptions);
    const userData = {
      user: {
        username: user.username,
        displayName: user.displayName,
        createdOn: user.createdOn,
        updatedOn: user.updatedOn,
      },
    };

    res.set('x-auth-token', token);
    res.success('user successfully authenticated', userData);
  } catch (error) {
    if (error instanceof BaseError) {
      return res.fatalError('fatal error while generating token', error);
    }
  }
};

export default generateToken;
