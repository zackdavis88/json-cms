import { Request, Response } from 'express';
import { Project, User } from 'src/models';
import { PaginationData } from 'src/controllers/validation_utils';
import getAllProjectsValidation from './getAllProjectsValidation';

const getAllProjects = async (req: Request, res: Response) => {
  let paginationData: PaginationData;
  try {
    paginationData = await getAllProjectsValidation(req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting project list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const projects = await Project.findAll({
      where: { isActive: true },
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
      include: [
        { model: User.scope('publicAttributes'), as: 'createdBy' },
        { model: User.scope('publicAttributes'), as: 'updatedBy' },
      ],
    });

    const projectList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      projects: projects.map((projectData) => ({
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        createdOn: projectData.createdOn,
        createdBy: projectData.createdBy ? {
          displayName: projectData.createdBy.displayName,
          username: projectData.createdBy.username,
        } : undefined,
        updatedBy: projectData.updatedBy ? {
          displayName: projectData.updatedBy.displayName,
          username: projectData.updatedBy.username,
        } : undefined,
      })),
    };

    return res.success('project list has been successfully retrieved', projectList);
  } catch (error) {
    return res.fatalError('fatal error while getting project list');
  }
};

export default getAllProjects;
