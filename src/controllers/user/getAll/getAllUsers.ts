import { Request, Response } from 'express';
import { User } from 'src/models';
import getAllUsersValidation, { PaginationData } from './getAllUsersValidation';

const getAllUsers = async (req: Request, res: Response) => {
  let paginationData: PaginationData;
  try {
    paginationData = await getAllUsersValidation(req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting user list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const users = await User.findAll({
      where: { isActive: true },
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
    });

    const userList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      users: users.map((userData) => ({
        username: userData.username,
        displayName: userData.displayName,
        createdOn: userData.createdOn,
      })),
    };

    return res.success('user list has been successfully retrieved', userList);
  } catch (error) {
    return res.fatalError('fatal error while getting user list');
  }
};

export default getAllUsers;
