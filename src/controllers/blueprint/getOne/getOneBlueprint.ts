import { Request, Response, NextFunction } from 'express';
import { uuidValidation } from 'src/controllers/validation_utils';
import { User, Blueprint, Project } from 'src/models';

interface BlueprintData {
  id: Blueprint['id'];
  name: Blueprint['name'];
  version: Blueprint['version'];
  fields: Blueprint['fields'];
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
  project: {
    id: Project['id'];
    name: Project['name'];
  };
}

export const getRequestedBlueprint = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const project = req.requestedProject;
  const blueprintId = req.params.blueprintId;

  const uuidValidationError = uuidValidation(blueprintId, 'blueprint');
  if (uuidValidationError) {
    return res.validationError(uuidValidationError);
  }

  try {
    const blueprint = (
      await project.getBlueprints({
        where: {
          id: blueprintId,
        },
        include: [
          { model: User, as: 'createdBy' },
          { model: User, as: 'updatedBy' },
        ],
      })
    )[0];

    if (!blueprint) {
      return res.notFoundError('requested blueprint not found');
    }

    req.requestedBlueprint = blueprint;
    next();
  } catch (getRequestedBlueprintFatalError) {
    res.fatalError('fatal error while getting requested blueprint');
  }
};

const getOneBlueprint = (req: Request, res: Response) => {
  const project = req.requestedProject;
  const blueprint = req.requestedBlueprint;

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

  res.success('blueprint has been successfully retrieved', { blueprint: blueprintData });
};

export default getOneBlueprint;
