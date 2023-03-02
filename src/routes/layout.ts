import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

export const layoutRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/layouts')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeLayoutAction)
    .get(AuthController.authorizeRead('layouts'));

  router
    .route('/projects/:projectId/layouts/:layoutId')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .get(AuthController.authorizeRead('layouts'))
    .post(AuthController.authorizeLayoutAction)
    .delete(AuthController.authorizeLayoutAction);
};
