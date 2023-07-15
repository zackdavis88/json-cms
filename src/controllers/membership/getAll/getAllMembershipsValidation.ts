import { Request } from 'express';
import { Project, Membership, User } from 'src/models';
import { paginationValidation, PaginationData } from 'src/controllers/validation_utils';

type GetAllMembershipsValidation = (
  project: Project,
  queryString: Request['query'],
) => Promise<PaginationData>;

const getAllMembershipsValidation: GetAllMembershipsValidation = async (
  project,
  queryString,
) => {
  const membershipCount = await Membership.count({
    where: {
      projectId: project.id,
    },
    include: {
      model: User.scope('publicAttributes'),
      as: 'user',
      where: { isActive: true },
    },
  });
  return paginationValidation(queryString, membershipCount);
};

export default getAllMembershipsValidation;
