import { Request, Response, NextFunction } from 'express';
import { User } from 'src/models';

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
    return res.fatalError('fatal error while authenitcating token');
  }
};
