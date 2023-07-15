import { Request, Response } from 'express';
import updateProjectValidation from './updateProjectValidation';

const updateProject = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  const user = req.user;
  const { name, description } = req.body;
  const validationError = updateProjectValidation(name, description);
  if (validationError) {
    return res.validationError(validationError);
  }

  if (name) {
    project.name = name;
  }

  if (description) {
    project.description = description;
  } else if (description === null || description === '') {
    project.description = null;
  }

  project.updatedOn = new Date();
  project.updatedById = user.id;
  try {
    await project.save();
  } catch (error) {
    return res.fatalError('fatal error while updating project');
  }

  const projectData = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdOn: project.createdOn,
      updatedOn: project.updatedOn,
      createdBy: project.createdBy ? {
        displayName: project.createdBy.displayName,
        username: project.createdBy.username,
      } : undefined,
      updatedBy: {
        displayName: user.displayName,
        username: user.username,
      },
    },
  };

  res.success('project has been successfully updated', projectData);
};

export default updateProject;
