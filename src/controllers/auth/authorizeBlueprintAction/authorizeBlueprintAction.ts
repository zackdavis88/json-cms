import { NextFunction, Request, Response } from 'express';

const authorizeBlueprintAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const project = req.requestedProject;
  const membership = (await project.getMemberships({ where: { userId: user.id } }))[0];
  const isProjectAdmin = membership?.isProjectAdmin;
  const isBlueprintManager = membership?.isBlueprintManager;

  if (!membership || !(isProjectAdmin || isBlueprintManager)) {
    return res.authorizationError('you do not have permission to manage blueprints');
  }
  next();
};

export default authorizeBlueprintAction;
