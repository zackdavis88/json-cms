import { Router } from 'express';
import { AuthValidation } from 'src/validation';
import { AuthController } from 'src/controllers';

export const authRoutes = (router: Router) => {
  router.route('/auth').get(AuthValidation.basicHeader, AuthController.generateToken);
};
