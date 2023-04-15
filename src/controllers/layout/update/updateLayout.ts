import { Request, Response } from 'express';
import { Layout, User, Project, Component, LayoutComponent } from 'src/models';
import updateLayoutValidation from './updateLayoutValidation';

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
  updatedOn: Layout['updatedOn'];
  updatedBy?: {
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

const updateLayout = async (req: Request, res: Response) => {
  const user = req.user;
  const project = req.requestedProject;
  const layout = req.requestedLayout;
  const { name, componentOrder } = req.body;
  try {
    const { validationError, components: componentArray } = await updateLayoutValidation(
      name,
      componentOrder,
    );
    if (validationError) {
      return res.validationError(validationError);
    }

    if (name) {
      layout.name = name;
    }

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
            layoutId: layout.id,
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

    try {
      // Remove existing LayoutComponents and then add the new ones if componentOrder is present.
      if (componentOrder) {
        await LayoutComponent.destroy({ where: { layoutId: layout.id } });
        await LayoutComponent.bulkCreate(componentData.layoutComponents);
      }

      layout.updatedOn = new Date();
      layout.updatedById = user.id;
      await layout.save();

      const layoutData: LayoutData = {
        id: layout.id,
        name: layout.name,
        componentOrder: componentOrder,
        components: componentData.components,
        project: {
          id: project.id,
          name: project.name,
        },
        createdOn: layout.createdOn,
        updatedOn: layout.updatedOn,
        updatedBy: {
          username: user.username,
          displayName: user.displayName,
        },
      };

      if (layout.createdBy) {
        layoutData.createdBy = {
          username: layout.createdBy.username,
          displayName: layout.createdBy.displayName,
        };
      }

      res.success('layout has been successfully updated', { layout: layoutData });
    } catch {
      res.fatalError('fatal error while updating layout');
    }
  } catch {
    res.fatalError('fatal error while validating update layout input');
  }
};

export default updateLayout;
