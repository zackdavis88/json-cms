import { Router } from 'express';
import { AuthController, MembershipController, ProjectController } from 'src/controllers';

export const membershipRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/memberships')
    .all(
      AuthController.authenticateToken,
      ProjectController.getRequestedProject,
      AuthController.authorizeProjectUpdate,
    )
    .post(MembershipController.create);
};
