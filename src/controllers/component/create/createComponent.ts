import { Request, Response } from 'express';
import createComponentValidation from './createComponentValidation';

const createComponent = async (req: Request, res: Response) => {
  const user = req.user;
  const project = req.requestedProject;
  const { name, content: contentInput, blueprintId } = req.body;

  try {
    const { validationError, blueprint, content } = await createComponentValidation(
      project,
      name,
      contentInput,
      blueprintId,
    );
    if (validationError) {
      return res.validationError(validationError);
    }

    if (!blueprint) {
      throw new Error();
    }

    try {
      const newComponent = await project.createComponent({
        name,
        content,
        createdById: user.id,
        blueprintId: blueprint.id,
      });

      const componentData = {
        component: {
          id: newComponent.id,
          name: newComponent.name,
          content: newComponent.content,
          createdOn: newComponent.createdOn,
          createdBy: {
            displayName: user.displayName,
            username: user.username,
          },
          blueprint: {
            id: blueprint.id,
            name: blueprint.name,
            version: blueprint.version,
          },
          project: {
            id: project.id,
            name: project.name,
          },
        },
      };

      res.success('component has been successfully created', componentData);
    } catch (error) {
      res.fatalError('fatal error while creating component');
    }
  } catch (error) {
    res.fatalError('fatal error while validating component input');
  }
};

export default createComponent;
