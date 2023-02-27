import { Request, Response } from 'express';
import { PaginationData } from 'src/controllers/validation_utils';
import { User, Component, Blueprint, BlueprintVersion } from 'src/models';
import getAllComponentsValidation from './getAllComponentsValidation';

interface ComponentData {
  id: Component['id'];
  name: Component['name'];
  createdOn: Component['createdOn'];
  updatedOn: Component['updatedOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  updatedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  blueprint: {
    id: Blueprint['id'];
    name: Blueprint['name'];
    version: Blueprint['version'];
    isCurrent: boolean;
  };
}

const getAllComponents = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  let paginationData: PaginationData;

  try {
    paginationData = await getAllComponentsValidation(project, req.query);
  } catch (error) {
    return res.fatalError('fatal error while getting component list count');
  }

  try {
    const { itemsPerPage, pageOffset, page, totalItems, totalPages } = paginationData;
    const components = await project.getComponents({
      where: { isActive: true },
      limit: itemsPerPage,
      offset: pageOffset,
      order: [['createdOn', 'ASC']],
      include: [
        { model: User, as: 'createdBy' },
        { model: User, as: 'updatedBy' },
        { model: Blueprint, as: 'blueprint' },
        { model: BlueprintVersion, as: 'blueprintVersion' },
      ],
    });

    const componentList = {
      page,
      totalItems,
      totalPages,
      itemsPerPage,
      project: {
        id: project.id,
        name: project.name,
      },
      components: components.map((component) => {
        const componentData: ComponentData = {
          id: component.id,
          name: component.name,
          createdOn: component.createdOn,
          updatedOn: component.updatedOn,
          blueprint: {
            id: component.blueprint.id,
            name: component.blueprint.name,
            version: component.blueprint.version,
            isCurrent: component.blueprintIsCurrent,
          },
        };

        if (component.createdBy) {
          componentData.createdBy = {
            displayName: component.createdBy.displayName,
            username: component.createdBy.username,
          };
        }

        if (component.updatedBy) {
          componentData.updatedBy = {
            displayName: component.updatedBy.displayName,
            username: component.updatedBy.username,
          };
        }

        if (component.blueprintVersion) {
          componentData.blueprint = {
            ...componentData.blueprint,
            name: component.blueprintVersion.name,
            version: component.blueprintVersion.version,
            isCurrent: false,
          };
        }

        return componentData;
      }),
    };

    return res.success('component list has been successfully retrieved', componentList);
  } catch (error) {
    return res.fatalError('fatal error while getting component list');
  }
};

export default getAllComponents;
