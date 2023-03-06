import { Request, Response } from 'express';
import { PaginationData } from 'src/controllers/validation_utils';
import { User, Layout } from 'src/models';
import getAllLayoutsValidation from './getAllLayoutsValidation';

interface LayoutData {
  id: Layout['id'];
  name: Layout['name'];
  totalComponents: number;
  createdOn: Layout['createdOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  updatedOn: Layout['updatedOn'];
  updatedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
}

const getAllLayouts = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  let paginationData: PaginationData;

  try {
    paginationData = await getAllLayoutsValidation(project, req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting layout list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const layouts = await project.getLayouts({
      where: { isActive: true },
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
      include: [
        {
          model: User.scope('publicAttributes'),
          as: 'createdBy',
        },
        {
          model: User.scope('publicAttributes'),
          as: 'updatedBy',
        },
      ],
    });

    const layoutList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      project: {
        id: project.id,
        name: project.name,
      },
      layouts: layouts.map((layout) => {
        const layoutData: LayoutData = {
          id: layout.id,
          name: layout.name,
          createdOn: layout.createdOn,
          updatedOn: layout.updatedOn,
          totalComponents: layout.componentOrder.length,
        };

        if (layout.createdBy) {
          layoutData.createdBy = {
            displayName: layout.createdBy.displayName,
            username: layout.createdBy.username,
          };
        }

        if (layout.updatedBy) {
          layoutData.updatedBy = {
            displayName: layout.updatedBy.displayName,
            username: layout.updatedBy.username,
          };
        }

        return layoutData;
      }),
    };

    return res.success('layout list has been successfully retrieved', layoutList);
  } catch (error) {
    console.log(error);
    return res.fatalError('fatal error while getting layout list');
  }
};

export default getAllLayouts;
