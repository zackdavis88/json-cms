import { Router } from 'express';
import { AuthController, ProjectController } from 'src/controllers';
// TODO: this is where you left off. Write the BlueprintController.
export const blueprintRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/blueprints')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeBlueprintAction);
};
