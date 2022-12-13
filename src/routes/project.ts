import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

export const projectRoutes = (router: Router) => {
  router
    .route('/projects')
    .all(AuthController.authenticateToken)
    .post(ProjectController.create)
    .get(ProjectController.getAll);

  router
    .route('/projects/:projectId')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .get(ProjectController.getOne)
    .post(AuthController.authorizeProjectUpdate, ProjectController.update)
    .delete(AuthController.authorizeProjectUpdate);
};
