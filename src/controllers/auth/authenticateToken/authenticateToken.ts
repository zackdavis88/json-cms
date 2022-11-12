import { Request, Response, NextFunction } from 'express';
import { User } from 'src/models';
import { DatabaseError } from 'sequelize';
import authenticateTokenValidation from './authenticateTokenValidation';

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['x-auth-token']
    ? req.headers['x-auth-token'].toString()
    : '';

  const { validationError, tokenData } = authenticateTokenValidation(header);
  if (validationError) {
    return res.validationError(validationError);
  }

  const { id = '', apiKey = '' } = tokenData || {};

  try {
    const user = await User.findOne({
      where: {
        id,
        apiKey,
        isActive: true,
      },
    });

    if (!user) {
      return res.authenticationError('x-auth-token user could not be authenticated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.validationError('x-auth-token contains an invalid value');
    }

    return res.fatalError('fatal error while authenitcating token');
  }
};

export default authenticateToken;
