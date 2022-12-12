import { Request, Response } from 'express';
import { Project } from 'src/models';
import createProjectValidation from './createProjectValidation';

const createProject = async (req: Request, res: Response) => {
  const user = req.user;
  const { name, description } = req.body;

  const validationError = createProjectValidation(name, description);
  if (validationError) {
    return res.validationError(validationError);
  }

  try {
    const project = await Project.create({
      name,
      description: description || null,
    });

    await project.createMembership({
      userId: user.id,
      isProjectAdmin: true,
    });

    const projectData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdOn: project.createdOn,
      },
    };

    res.success('project has been successfully created', projectData);
  } catch (fatalError) {
    res.fatalError('fatal error while creating project');
  }
};

export default createProject;
