import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

export const componentRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/components')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeComponentAction);

  router
    .route('/projects/:projectId/components/:componentId')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject);
};
