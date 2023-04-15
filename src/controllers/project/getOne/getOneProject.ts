import { NextFunction, Request, Response } from 'express';
import { Project, User } from 'src/models';
import { uuidValidation } from 'src/controllers/validation_utils';

export const getRequestedProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const projectId = req.params.projectId;

  const uuidValidationError = uuidValidation(projectId, 'project');
  if (uuidValidationError) {
    return res.validationError(uuidValidationError);
  }

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        isActive: true,
      },
      include: [
        { model: User.scope('publicAttributes'), as: 'createdBy' },
        { model: User.scope('publicAttributes'), as: 'updatedBy' },
      ],
    });

    if (!project) {
      return res.notFoundError('requested project not found');
    }

    req.requestedProject = project;
    next();
  } catch (getRequestedProjectFatalError) {
    res.fatalError('fatal error while getting requested project');
  }
};

const getOneProject = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  try {
    const projectData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdOn: project.createdOn,
        updatedOn: project.updatedOn,
        membershipsCount: await project.countMemberships(),
        createdBy: project.createdBy ? {
          displayName: project.createdBy.displayName,
          username: project.createdBy.username,
        } : undefined,
        updatedBy: project.updatedBy ? {
          displayName: project.updatedBy.displayName,
          username: project.updatedBy.username,
        } : undefined,
      },
    };

    res.success('project has been successfully retrieved', projectData);
  } catch (error) {
    res.fatalError('fatal error while getting project');
  }
};

export default getOneProject;
