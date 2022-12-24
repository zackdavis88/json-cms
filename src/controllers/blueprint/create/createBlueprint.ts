import { Request, Response } from 'express';
import { Blueprint } from 'src/models';
import createBlueprintValidation from './createBlueprintValidation';

const createBlueprint = async (req: Request, res: Response) => {
  const user = req.user;
  const project = req.requestedProject;
  const { name, fields: fieldsInput } = req.body;
  const { validationError, fields } = createBlueprintValidation(name, fieldsInput);
  if (validationError) {
    return res.validationError(validationError);
  }

  try {
    const newBlueprint = await Blueprint.create({
      name,
      fields,
      version: 1,
      createdOn: new Date(),
      createdById: user.id,
      projectId: project.id,
    });

    const blueprintData = {
      blueprint: {
        id: newBlueprint.id,
        name: newBlueprint.name,
        fields: newBlueprint.fields,
        version: newBlueprint.version,
        createdOn: newBlueprint.createdOn,
        createdBy: {
          displayName: user.displayName,
          username: user.username,
        },
        project: {
          id: project.id,
          name: project.name,
        },
      },
    };

    res.success('blueprint has been successfully created', blueprintData);
  } catch (error) {
    res.fatalError('fatal error while creating blueprint');
  }
  res.success('blueprint has been successfully created');
};

export default createBlueprint;
