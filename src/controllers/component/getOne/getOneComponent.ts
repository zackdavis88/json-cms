import { Request, Response, NextFunction } from 'express';
import { uuidValidation } from 'src/controllers/validation_utils';
import { User, Blueprint, BlueprintVersion, Project, Component } from 'src/models';

interface ComponentData {
  id: Component['id'];
  name: Component['name'];
  content: Component['content'];
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
  project: {
    id: Project['id'];
    name: Project['name'];
  };
  blueprint: {
    id: Blueprint['id'];
    name: Blueprint['name'];
    version: Blueprint['version'];
    isCurrent: boolean;
  };
}

export const getRequestedComponent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const project = req.requestedProject;
  const componentId = req.params.componentId;

  const uuidValidationError = uuidValidation(componentId, 'component');
  if (uuidValidationError) {
    return res.validationError(uuidValidationError);
  }

  try {
    const component = (
      await project.getComponents({
        where: {
          id: componentId,
          isActive: true,
        },
        include: [
          { model: User, as: 'createdBy' },
          { model: User, as: 'updatedBy' },
          { model: Blueprint, as: 'blueprint' },
          { model: BlueprintVersion, as: 'blueprintVersion' },
        ],
      })
    )[0];

    if (!component) {
      return res.notFoundError('requested component not found');
    }

    req.requestedComponent = component;
    next();
  } catch (error) {
    res.fatalError('fatal error while getting requested component');
  }
};

const getOneComponent = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  const component = req.requestedComponent;

  const componentData: ComponentData = {
    id: component.id,
    name: component.name,
    content: component.content,
    project: {
      id: project.id,
      name: project.name,
    },
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
    };
  }

  res.success('component has been successfully retrieved', { component: componentData });
};

export default getOneComponent;
