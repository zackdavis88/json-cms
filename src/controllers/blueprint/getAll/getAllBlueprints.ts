import { Request, Response } from 'express';
import { PaginationData } from 'src/controllers/validation_utils';
import { User, Blueprint } from 'src/models';
import getAllBlueprintsValidation from './getAllBlueprintsValidation';

interface BlueprintData {
  id: Blueprint['id'];
  name: Blueprint['name'];
  version: Blueprint['version'];
  createdOn: Blueprint['createdOn'];
  updatedOn: Blueprint['updatedOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  updatedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
}

const getAllBlueprints = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  let paginationData: PaginationData;

  try {
    paginationData = await getAllBlueprintsValidation(project, req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting blueprint list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const blueprints = await project.getBlueprints({
      where: { isActive: true },
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
      include: [
        { model: User.scope('publicAttributes'), as: 'createdBy' },
        { model: User.scope('publicAttributes'), as: 'updatedBy' },
      ],
    });

    const blueprintList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      project: {
        id: project.id,
        name: project.name,
      },
      blueprints: blueprints.map((blueprint) => {
        const blueprintData: BlueprintData = {
          id: blueprint.id,
          name: blueprint.name,
          version: blueprint.version,
          createdOn: blueprint.createdOn,
          updatedOn: blueprint.updatedOn,
        };

        if (blueprint.createdBy) {
          blueprintData.createdBy = {
            displayName: blueprint.createdBy.displayName,
            username: blueprint.createdBy.username,
          };
        }

        if (blueprint.updatedBy) {
          blueprintData.updatedBy = {
            displayName: blueprint.updatedBy.displayName,
            username: blueprint.updatedBy.username,
          };
        }

        return blueprintData;
      }),
    };

    return res.success('blueprint list has been successfully retrieved', blueprintList);
  } catch (error) {
    return res.fatalError('fatal error while getting blueprint list');
  }
};

export default getAllBlueprints;
