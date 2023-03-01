import { Request, Response, NextFunction } from 'express';

const authorizeComponentRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const project = req.requestedProject;
  const membership = (await project.getMemberships({ where: { userId: user.id } }))[0];

  if (!membership) {
    return res.authorizationError('you do not have permission to read components');
  }
  next();
};

export default authorizeComponentRead;
