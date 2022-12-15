import { Router } from 'express';
import { AuthController, MembershipController, ProjectController } from 'src/controllers';

export const membershipRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/memberships')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeProjectUpdate, MembershipController.create)
    .get(MembershipController.getAll);
};
