import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';

export const userRoutes = (router: Router) => {
  router
    .route('/users')
    .post(UserController.create)
    .get(AuthController.authenticateToken, UserController.getAll);

  router
    .route('/users/:username')
    .all(AuthController.authenticateToken, UserController.getRequestedUser)
    .get(UserController.getOne);
};
