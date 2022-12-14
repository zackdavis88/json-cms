import { Router } from 'express';
import { AuthController, MembershipController, ProjectController } from 'src/controllers';

export const membershipRoutes = (router: Router) => {
  router
    .route('/projects/:projectId/memberships')
    .all(AuthController.authenticateToken, ProjectController.getRequestedProject)
    .post(AuthController.authorizeProjectUpdate, MembershipController.create)
    .get(MembershipController.getAll);

  router
    .route('/projects/:projectId/memberships/:membershipId')
    .all(
      AuthController.authenticateToken,
      ProjectController.getRequestedProject,
      MembershipController.getRequestedMembership,
    )
    .get(MembershipController.getOne)
    .post(AuthController.authorizeProjectUpdate, MembershipController.update)
    .delete(AuthController.authorizeProjectUpdate, MembershipController.remove);
};
