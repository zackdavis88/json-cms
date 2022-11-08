import { Request, Response, NextFunction } from 'express';
import { User } from 'src/models';
import { DatabaseError } from 'sequelize';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, apiKey } = req.tokenData;

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
