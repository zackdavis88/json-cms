import { Request, Response } from 'express';
import { Layout, User, Project, Component, LayoutComponent } from 'src/models';
import createLayoutValidation from './createLayoutValidation';

interface LayoutData {
  id: Layout['id'];
  name: Layout['name'];
  componentOrder: Component['id'][];
  components: {
    [key: Component['id']]: {
      id: Component['id'];
      name: Component['name'];
      content: Component['content'];
    };
  };
  createdOn: Layout['createdOn'];
  createdBy?: {
    displayName: User['displayName'];
    username: User['username'];
  };
  project: {
    id: Project['id'];
    name: Project['name'];
  };
}

interface TransformedComponentData {
  components: LayoutData['components'];
  layoutComponents: {
    layoutId: Layout['id'];
    componentId: Component['id'];
    order: number;
  }[];
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

    try {
      const newLayout = await project.createLayout({
        name,
        createdById: user.id,
      });

      const componentData = componentArray.reduce<TransformedComponentData>(
        (prev, component) => {
          return {
            components: {
              ...prev.components,
              [component.id]: {
                id: component.id,
                name: component.name,
                content: component.content,
              },
            },
            layoutComponents: prev.layoutComponents.concat({
              layoutId: newLayout.id,
              componentId: component.id,
              order: componentOrder.indexOf(component.id),
            }),
          };
        },
        {
          components: {},
          layoutComponents: [],
        },
      );

      await LayoutComponent.bulkCreate(componentData.layoutComponents);

      const layoutData = {
        id: newLayout.id,
        name: newLayout.name,
        componentOrder: componentOrder,
        components: componentData.components,
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
