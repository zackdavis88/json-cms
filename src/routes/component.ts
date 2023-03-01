import { Router } from 'express';
import { AuthController, ProjectController, ComponentController } from 'src/controllers';

export const componentRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/components')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeComponentAction, ComponentController.create)
    .get(AuthController.authorizeComponentRead, ComponentController.getAll);

  router
    .route('/projects/:projectId/components/:componentId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getRequestedProject,
      ComponentController.getRequestedComponent,
    )
    .get(AuthController.authorizeComponentRead, ComponentController.getOne)
    .post(AuthController.authorizeComponentAction, ComponentController.update);
};
