import { Router } from 'express';
import { UserController } from 'src/controllers';
import { UserValidation } from 'src/validation';

export const userRoutes = (router: Router) => {
  router.route('/users').post(UserValidation.create, UserController.create);
};
