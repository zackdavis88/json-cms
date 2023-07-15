import { NextFunction, Request, Response } from 'express';

const authorizeLayoutAction = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const project = req.requestedProject;
  const membership = (await project.getMemberships({ where: { userId: user.id } }))[0];
  const isProjectAdmin = membership?.isProjectAdmin;
  const isLayoutManager = membership?.isLayoutManager;

  if (!membership || !(isProjectAdmin || isLayoutManager)) {
    return res.authorizationError('you do not have permission to manage layouts');
  }
  next();
};

export default authorizeLayoutAction;
