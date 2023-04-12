import { Router } from 'express';
import { AuthController, ProjectController, LayoutController } from 'src/controllers';

export const layoutRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/layouts')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeLayoutAction, LayoutController.create)
    .get(AuthController.authorizeRead('layouts'), LayoutController.getAll);

  router
    .route('/projects/:projectId/layouts/:layoutId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getRequestedProject,
      LayoutController.getRequestedLayout,
    )
    .get(AuthController.authorizeRead('layouts'), LayoutController.getOne)
    .post(AuthController.authorizeLayoutAction, LayoutController.update)
    .delete(AuthController.authorizeLayoutAction, LayoutController.remove);
};
