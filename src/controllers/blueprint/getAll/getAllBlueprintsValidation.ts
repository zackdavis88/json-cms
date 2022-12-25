import { Request } from 'express';
import { Project } from 'src/models';
import { paginationValidation, PaginationData } from 'src/controllers/validation_utils';

type GetAllBlueprintsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllBlueprintsValidation: GetAllBlueprintsValidation = async (
  project,
  queryString,
) => {
  const blueprintCount = await project.countBlueprints({ where: { isActive: true } });
  return paginationValidation(queryString, blueprintCount);
};

export default getAllBlueprintsValidation;
