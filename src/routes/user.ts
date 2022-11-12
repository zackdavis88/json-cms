import { Router } from 'express';
import { UserController } from 'src/controllers';

export const userRoutes = (router: Router) => {
  router.route('/users').post(UserController.create);
};
