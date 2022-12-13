import { Request, Response } from 'express';
import removeProjectValidation from './removeProjectValidation';

const removeProject = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  const confirm = req.body.confirm;
  const validationError = removeProjectValidation(confirm, project.name);
  if (validationError) {
    return res.validationError(validationError);
  }

  project.isActive = false;
  project.deletedOn = new Date();
  await project.save();

  const projectData = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdOn: project.createdOn,
      deletedOn: project.deletedOn,
    },
  };

  res.success('project has been successfully removed', projectData);
};

export default removeProject;
