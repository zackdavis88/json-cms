import { Request } from 'express';
import { Project } from 'src/models';
import { paginationValidation, PaginationData } from 'src/controllers/validation_utils';

type GetAllLayoutsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllLayoutsValidation: GetAllLayoutsValidation = async (project, queryString) => {
  const layoutCount = await project.countLayouts({ where: { isActive: true } });
  return paginationValidation(queryString, layoutCount);
};

export default getAllLayoutsValidation;
