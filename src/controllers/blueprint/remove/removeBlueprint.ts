import { Request, Response } from 'express';
import removeBlueprintValidation from './removeBlueprintValidation';
import { Blueprint, Project, User } from 'src/models';

interface BlueprintData {
  id: Blueprint['id'];
  name: Blueprint['name'];
  version: Blueprint['version'];
  fields: Blueprint['fields'];
  createdOn: Blueprint['createdOn'];
  updatedOn: Blueprint['updatedOn'];
  deletedOn: Blueprint['deletedOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  updatedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  deletedBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  project: {
    id: Project['id'];
    name: Project['name'];
  };
}

const removeBlueprint = async (req: Request, res: Response) => {
  const project = req.requestedProject;
  const user = req.user;
  const blueprint = req.requestedBlueprint;
  const confirm = req.body.confirm;
  const validationError = removeBlueprintValidation(confirm, blueprint.name);
  if (validationError) {
    return res.validationError(validationError);
  }

  blueprint.isActive = false;
  blueprint.deletedOn = new Date();
  blueprint.deletedById = user.id;

  try {
    await blueprint.save();
  } catch (error) {
    return res.fatalError('fatal error while removing blueprint');
  }

  const blueprintData: BlueprintData = {
    id: blueprint.id,
    name: blueprint.name,
    version: blueprint.version,
    fields: blueprint.fields,
    project: {
      id: project.id,
      name: project.name,
    },
    createdOn: blueprint.createdOn,
    updatedOn: blueprint.updatedOn,
    deletedOn: blueprint.deletedOn,
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

  blueprintData.deletedBy = {
    displayName: user.displayName,
    username: user.username,
  };

  res.success('blueprint has been successfully removed', { blueprint: blueprintData });
};

export default removeBlueprint;
