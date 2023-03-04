import { Request, Response } from 'express';
import { Layout, User, Project, Component } from 'src/models';
import createLayoutValidation from './createLayoutValidation';

interface LayoutData {
  id: Layout['id'];
  name: Layout['name'];
  componentOrder: Layout['componentOrder'];
  components: {
    [key: Component['id']]: {
      id: Component['id'];
      name: Component['name'];
      content: Component['content'];
    };
  };
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

const createLayout = async (req: Request, res: Response) => {
  const user = req.user;
  const project = req.requestedProject;
  const { name, componentOrder } = req.body;

  try {
    const { validationError, components: componentArray } = await createLayoutValidation(
      name,
      componentOrder,
    );
    if (validationError) {
      return res.validationError(validationError);
    }

    const components = componentArray.reduce<LayoutData['components']>(
      (prev, component) => {
        return {
          ...prev,
          [component.id]: {
            id: component.id,
            name: component.name,
            content: component.content,
          },
        };
      },
      {},
    );

    try {
      const newLayout = await project.createLayout({
        name,
        componentOrder: componentOrder || [],
        createdById: user.id,
      });

      await newLayout.addComponents(componentArray);

      const layoutData = {
        id: newLayout.id,
        name: newLayout.name,
        componentOrder: newLayout.componentOrder,
        components,
        project: {
          id: project.id,
          name: project.name,
        },
        createdOn: newLayout.createdOn,
        createdBy: {
          displayName: user.displayName,
          username: user.username,
        },
      };

      res.success('layout has been successfully created', { layout: layoutData });
    } catch {
      res.fatalError('fatal error while creating layout');
    }
  } catch {
    res.fatalError('fatal error while validating layout input');
  }
};

export default createLayout;
