import { Request, Response, NextFunction } from 'express';

const authorizeProjectUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  const project = req.requestedProject;

  const projectMembers = await project.getMemberships({ where: { userId: user.id } });
  const userIsMember = projectMembers.length === 1;
  const isProjectAdmin = projectMembers[0]?.isProjectAdmin;

  if (!userIsMember || !isProjectAdmin) {
    return res.authorizationError('you do not have permission to update this project');
  }

  next();
};

export default authorizeProjectUpdate;
