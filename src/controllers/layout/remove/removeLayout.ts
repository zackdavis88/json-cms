import { Request, Response } from 'express';
import removeLayoutValidation from './removeLayoutValidation';
import { Layout, LayoutComponent, Project, User } from 'src/models';

interface LayoutData {
  id: Layout['id'];
  name: Layout['name'];
  createdOn: Layout['createdOn'];
  createdBy?: {
    username: User['username'];
    displayName: User['displayName'];
  };
  updatedOn: Layout['updatedOn'];
  updatedBy?: {
    username: User['username'];
    displayName: User['displayName'];
  };
  deletedOn: Layout['deletedOn'];
  deletedBy?: {
    username: User['username'];
    displayName: User['displayName'];
  };
  project: {
    id: Project['id'];
    name: Project['name'];
  };
}

const removeLayout = async (req: Request, res: Response) => {
  const layout = req.requestedLayout;
  const user = req.user;
  const project = req.requestedProject;
  const confirm = req.body.confirm;
  const validationError = removeLayoutValidation(confirm, layout.name);
  if (validationError) {
    return res.validationError(validationError);
  }

  layout.isActive = false;
  layout.deletedOn = new Date();
  layout.deletedById = user.id;

  try {
    await layout.save();
  } catch (error) {
    return res.fatalError('fatal error while removing layout');
  }

  // We need to remove any LayoutComponents that were associated with this layout being removed.
  await LayoutComponent.destroy({ where: { layoutId: layout.id } });

  const layoutData: LayoutData = {
    id: layout.id,
    name: layout.name,
    createdOn: layout.createdOn,
    updatedOn: layout.updatedOn,
    deletedOn: layout.deletedOn,
    project: {
      id: project.id,
      name: project.name,
    },
    deletedBy: {
      displayName: user.displayName,
      username: user.username,
    },
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

  res.success('layout has been successfully removed', { layout: layoutData });
};

export default removeLayout;
