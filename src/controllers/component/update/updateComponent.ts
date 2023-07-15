import { Request, Response } from 'express';
import { Component, Project, Blueprint, User } from 'src/models';
import updateComponentValidation from './updateComponentValidation';

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

const updateComponent = async (req: Request, res: Response) => {
  const user = req.user;
  const project = req.requestedProject;
  const component = req.requestedComponent;
  const blueprint = component.blueprint;
  const blueprintVersion = component.blueprintVersion;
  const fields = blueprintVersion ? blueprintVersion.fields : blueprint.fields;
  const { name, content: contentInput } = req.body;

  const { validationError, content } = updateComponentValidation(
    name,
    contentInput,
    fields,
  );
  if (validationError) {
    return res.validationError(validationError);
  }

  if (name) {
    component.name = name;
  }

  // Check if we actually received content input.
  if (contentInput && Object.keys(content).length > 0) {
    // Use the sanitized content.
    component.content = content;
  }

  component.updatedOn = new Date();
  component.updatedById = user.id;

  try {
    await component.save();
  } catch (error) {
    res.fatalError('fatal error while updating component');
  }

  const componentData: ComponentData = {
    id: component.id,
    name: component.name,
    content: component.content,
    createdOn: component.createdOn,
    updatedOn: component.updatedOn,
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
    updatedBy: {
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

  if (component.blueprintVersion) {
    componentData.blueprint = {
      ...componentData.blueprint,
      name: component.blueprintVersion.name,
      version: component.blueprintVersion.version,
    };
  }

  res.success('component has been successfully updated', { component: componentData });
};

export default updateComponent;
