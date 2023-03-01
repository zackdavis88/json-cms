import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

export const layoutRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/layouts')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeComponentAction)
    .get(AuthController.authorizeRead('layouts'));

  router
    .route('/projects/:projectId/layouts/:layoutId')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .get(AuthController.authorizeRead('layouts'))
    .post(AuthController.authorizeComponentAction)
    .delete(AuthController.authorizeComponentAction);
};
