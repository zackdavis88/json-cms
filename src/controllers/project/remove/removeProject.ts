import { Request, Response } from 'express';
import removeProjectValidation from './removeProjectValidation';

const removeProject = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  const user = req.user;
  const confirm = req.body.confirm;
  const validationError = removeProjectValidation(confirm, project.name);
  if (validationError) {
    return res.validationError(validationError);
  }

  project.isActive = false;
  project.deletedOn = new Date();
  project.deletedById = user.id;
  try {
    await project.save();
  } catch (error) {
    return res.fatalError('fatal error while removing project');
  }

  const projectData = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdOn: project.createdOn,
      createdBy: project.createdBy ? {
        displayName: project.createdBy.displayName,
        username: project.createdBy.username,
      } : undefined,
      updatedOn: project.updatedOn,
      updatedBy: project.updatedBy ? {
        displayName: project.updatedBy.displayName,
        username: project.updatedBy.username,
      } : undefined,
      deletedOn: project.deletedOn,
      deletedBy: {
        displayName: user.displayName,
        username: user.username,
      }
    },
  };

  res.success('project has been successfully removed', projectData);
};

export default removeProject;
