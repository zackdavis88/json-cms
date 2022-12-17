import { Request, Response, NextFunction } from 'express';

const authorizeProjectUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const project = req.requestedProject;
  const membership = (await project.getMemberships({ where: { userId: user.id } }))[0];
  const isProjectAdmin = membership?.isProjectAdmin;

  if (!membership || !isProjectAdmin) {
    return res.authorizationError('you do not have permission to update this project');
  }

  next();
};

export default authorizeProjectUpdate;
