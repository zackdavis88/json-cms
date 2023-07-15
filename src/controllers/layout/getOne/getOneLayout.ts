import { NextFunction, Request, Response } from 'express';
import { uuidValidation } from 'src/controllers/validation_utils';
import { User, Component, Layout, LayoutComponent } from 'src/models';

interface LayoutData extends TransformedComponentData {
  id: Layout['id'];
  name: Layout['name'];
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
}

interface TransformedComponentData {
  componentOrder: Component['id'][];
  components: {
    [key: Component['id']]: {
      id: Component['id'];
      name: Component['name'];
      content: Component['content'];
    };
  };
}

export const getRequestedLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const project = req.requestedProject;
  const layoutId = req.params.layoutId;

  const uuidValidationError = uuidValidation(layoutId, 'layout');
  if (uuidValidationError) {
    return res.validationError(uuidValidationError);
  }

  try {
    const layout = (
      await project.getLayouts({
        where: {
          id: layoutId,
          isActive: true,
        },
        include: [
          {
            model: User.scope('publicAttributes'),
            as: 'createdBy',
          },
          {
            model: User.scope('publicAttributes'),
            as: 'updatedBy',
          },
          {
            model: LayoutComponent,
            as: 'components',
            required: false,
            include: [{ model: Component, as: 'component', where: { isActive: true } }],
          },
        ],
        order: [
          ['createdOn', 'ASC'],
          ['components', 'order', 'ASC'],
        ],
      })
    )[0];

    if (!layout) {
      return res.notFoundError('requested layout not found');
    }

    req.requestedLayout = layout;
    next();
  } catch (error) {
    res.fatalError('fatal error while getting requested layout');
  }
};

const getOneLayout = (req: Request, res: Response) => {
  const layout = req.requestedLayout;
  const componentData = layout.components.reduce<TransformedComponentData>(
    (prev, layoutComponent) => {
      const component = layoutComponent.component;
      return {
        componentOrder: [...prev.componentOrder, component.id],
        components: {
          ...prev.components,
          [component.id]: {
            id: component.id,
            name: component.name,
            content: component.content,
          },
        },
      };
    },
    {
      componentOrder: [],
      components: {},
    },
  );

  const layoutData: LayoutData = {
    id: layout.id,
    name: layout.name,
    createdOn: layout.createdOn,
    updatedOn: layout.updatedOn,
    componentOrder: componentData.componentOrder,
    components: componentData.components,
  };

  if (layout.createdBy) {
    layoutData.createdBy = {
      displayName: layout.createdBy.displayName,
      username: layout.createdBy.username,
    };
  }

  if (layout.updatedBy) {
    layoutData.updatedBy = {
      displayName: layout.updatedBy.displayName,
      username: layout.updatedBy.username,
    };
  }
  res.success('layout has been successfully retrieved', {
    layout: layoutData,
  });
};

export default getOneLayout;
