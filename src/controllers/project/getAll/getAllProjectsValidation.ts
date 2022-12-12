import { Request } from 'express';
import { Project } from 'src/models';
import { paginationValidation } from 'src/controllers/validation_utils';

export type PaginationData = ReturnType<typeof paginationValidation>;

type GetAllProjectsValidation = (
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllProjectsValidation: GetAllProjectsValidation = async (queryString) => {
  const projectCount = await Project.count({ where: { isActive: true } });
  return paginationValidation(queryString, projectCount);
};

export default getAllProjectsValidation;
