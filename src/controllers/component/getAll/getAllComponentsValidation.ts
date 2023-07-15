import { Request } from 'express';
import { Project } from 'src/models';
import { paginationValidation, PaginationData } from 'src/controllers/validation_utils';

type GetAllComponentsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllComponentsValidation: GetAllComponentsValidation = async (
  project,
  queryString,
) => {
  const componentCount = await project.countComponents({ where: { isActive: true } });
  return paginationValidation(queryString, componentCount);
};

export default getAllComponentsValidation;
