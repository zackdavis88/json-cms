import { Request } from 'express';
import { Project } from 'src/models';
import { paginationValidation, PaginationData } from 'src/controllers/validation_utils';

type GetAllMembershipsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllMembershipsValidation: GetAllMembershipsValidation = async (
  project,
  queryString,
) => {
  const membershipCount = await project.countMemberships();
  return paginationValidation(queryString, membershipCount);
};

export default getAllMembershipsValidation;
