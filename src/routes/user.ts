import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';

export const userRoutes = (router: Router) => {
  router
    .route('/users')
    .post(UserController.create)
    .get(AuthController.authenticateToken, UserController.getAll);

  router
    .route('/users/:username')
    .all(AuthController.authenticateToken)
    .get(UserController.getOne)
    .post(AuthController.authorizeUserUpdate, UserController.update)
    .delete(AuthController.authorizeUserUpdate, UserController.remove);
};
