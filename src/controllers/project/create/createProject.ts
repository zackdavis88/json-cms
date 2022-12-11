import { Request, Response } from 'express';
import { Project } from 'src/models';

const createProject = async (req: Request, res: Response) => {
  const user = req.user;
  const project = await Project.create({
    name: 'testing associations 1',
  });

  await project.createMembership({
    userId: user.id,
    isProjectAdmin: true,
  });

  const projectData = {
    id: project.id,
    name: project.name,
    description: project.description,
    createdOn: project.createdOn,
  };

  res.success('project has been successfully created', projectData);
};

export default createProject;
