import { Router } from 'express';
import { AuthController, UserController } from 'src/controllers';

export const userRoutes = (router: Router) => {
  router
    .route('/users')
    .post(UserController.create)
    .get(AuthController.authenticateToken, UserController.getAll);
};
