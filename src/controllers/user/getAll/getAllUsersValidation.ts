import { Request } from 'express';
import { User } from 'src/models';
import { paginationValidation } from 'src/controllers/validation_utils';

export type PaginationData = ReturnType<typeof paginationValidation>;

type GetAllUsersValidation = (queryString: Request['query']) => Promise<PaginationData>;

const getAllUsersValidation: GetAllUsersValidation = async (queryString) => {
  const userCount = await User.count({ where: { isActive: true } });
  return paginationValidation(queryString, userCount);
};

export default getAllUsersValidation;
