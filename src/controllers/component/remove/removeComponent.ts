import { Request, Response } from 'express';
import { Component, Project, Blueprint, User } from 'src/models';
import removeComponentValidation from './removeComponentValidation';

interface ComponentData {
  id: Component['id'];
  name: Component['name'];
  content: Component['content'];
  createdOn: Component['createdOn'];
  updatedOn: Component['updatedOn'];
  deletedOn: Component['deletedOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  updatedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  deletedBy: {
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

const removeComponent = async (req: Request, res: Response) => {
  const component = req.requestedComponent;
  const user = req.user;
  const project = req.requestedProject;
  const confirm = req.body.confirm;
  const validationError = removeComponentValidation(confirm, component.name);
  if (validationError) {
    return res.validationError(validationError);
  }

  component.isActive = false;
  component.deletedOn = new Date();
  component.deletedById = user.id;

  try {
    await component.save();
  } catch (error) {
    return res.fatalError('fatal error while removing component');
  }

  const componentData: ComponentData = {
    id: component.id,
    name: component.name,
    content: component.content,
    createdOn: component.createdOn,
    updatedOn: component.updatedOn,
    deletedOn: component.deletedOn,
    project: {
      id: project.id,
      name: project.name,
    },
    blueprint: {
      id: component.blueprint.id,
      name: component.blueprint.name,
      version: component.blueprint.version,
      isCurrent: component.blueprintIsCurrent,
    },
    deletedBy: {
      displayName: user.displayName,
      username: user.username,
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

  res.success('component has been successfully removed', { component: componentData });
};

export default removeComponent;
