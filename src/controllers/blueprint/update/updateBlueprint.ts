import { Request, Response } from 'express';
import { Blueprint, Project, User, Component } from 'src/models';
import updateBlueprintValidation from './updateBlueprintValidation';

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

const updateBlueprint = async (req: Request, res: Response) => {
  const blueprint = req.requestedBlueprint;
  const user = req.user;
  const project = req.requestedProject;
  const { name, fields: fieldsInput } = req.body;
  const { validationError, fields } = updateBlueprintValidation(name, fieldsInput);
  if (validationError) {
    return res.validationError(validationError);
  }

  try {
    const blueprintVersion = await blueprint.createVersion({
      name: blueprint.name,
      version: blueprint.version,
      fields: blueprint.fields,
    });

    // If any components exist that reference this blueprint, we need to update them with the blueprintVersion.
    await Component.update(
      { blueprintVersionId: blueprintVersion.id, blueprintIsCurrent: false },
      {
        where: {
          blueprintId: blueprint.id,
          isActive: true,
          blueprintIsCurrent: true,
        },
      },
    );
  } catch (error) {
    return res.fatalError('fatal error while creating blueprint version');
  }

  if (name) {
    blueprint.name = name;
  }

  if (fieldsInput && fields.length > 0) {
    blueprint.fields = fields;
  }

  blueprint.updatedOn = new Date();
  blueprint.updatedById = user.id;
  blueprint.version = blueprint.version + 1;

  try {
    await blueprint.save();
  } catch (error) {
    res.fatalError('fatal error while updating blueprint');
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
  };

  if (blueprint.createdBy) {
    blueprintData.createdBy = {
      displayName: blueprint.createdBy.displayName,
      username: blueprint.createdBy.username,
    };
  }

  blueprintData.updatedBy = {
    displayName: user.displayName,
    username: user.username,
  };

  res.success('blueprint has been successfully updated', { blueprint: blueprintData });
};

export default updateBlueprint;
