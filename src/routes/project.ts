import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';

export const projectRoutes = (router: Router) => {
  router
    .route('/projects')
    .all(AuthController.authenticateToken)
    .post(ProjectController.create)
    .get(ProjectController.getAll);
};
