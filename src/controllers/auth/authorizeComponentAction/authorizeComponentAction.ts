import { NextFunction, Request, Response } from 'express';

const authorizeComponentAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const project = req.requestedProject;
  const membership = (await project.getMemberships({ where: { userId: user.id } }))[0];
  const isProjectAdmin = membership?.isProjectAdmin;
  const isComponentManager = membership?.isComponentManager;

  if (!membership || !(isProjectAdmin || isComponentManager)) {
    return res.authorizationError('you do not have permission to manage components');
  }
  next();
};

export default authorizeComponentAction;
