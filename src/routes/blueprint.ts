import { Router } from 'express';
import { AuthController, ProjectController, BlueprintController } from 'src/controllers';

export const blueprintRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/blueprints')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeBlueprintAction, BlueprintController.create)
    .get(AuthController.authorizeBlueprintRead, BlueprintController.getAll);

  router
    .route('/projects/:projectId/blueprints/:blueprintId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getRequestedProject,
      BlueprintController.getRequestedBlueprint,
    )
    .get(AuthController.authorizeBlueprintRead, BlueprintController.getOne)
    .post(AuthController.authorizeBlueprintAction, BlueprintController.update)
    .delete(AuthController.authorizeBlueprintAction, BlueprintController.remove);
};
