import { Request, Response } from 'express';
import { User } from 'src/models';
import { PaginationData } from 'src/controllers/validation_utils';
import getAllMembershipsValidation from './getAllMembershipsValidation';

const getAllMemberships = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  let paginationData: PaginationData;

  try {
    paginationData = await getAllMembershipsValidation(project, req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting membership list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const memberships = await project.getMemberships({
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
      include: {
        model: User.scope('publicAttributes'),
        as: 'user',
        where: { isActive: true },
      },
    });

    const membershipList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      project: {
        id: project.id,
        name: project.name,
      },
      memberships: memberships.map((membership) => ({
        id: membership.id,
        createdOn: membership.createdOn,
        user: {
          username: membership.user.username,
          displayName: membership.user.displayName,
        },
        isProjectAdmin: membership.isProjectAdmin,
        isBlueprintManager: membership.isBlueprintManager,
        isComponentManager: membership.isComponentManager,
        isLayoutManager: membership.isLayoutManager,
        isFragmentManager: membership.isFragmentManager,
      })),
    };

    return res.success('membership list has been successfully retrieved', membershipList);
  } catch (error) {
    return res.fatalError('fatal error while getting membership list');
  }
};

export default getAllMemberships;
