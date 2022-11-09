import { Router } from 'express';
import { AuthValidation } from 'src/validation';
import { AuthController } from 'src/controllers';

export const authRoutes = (router: Router) => {
  router.route('/auth').get(AuthValidation.basicHeader, AuthController.generateToken);

  router
    .route('/auth/token')
    .get(AuthValidation.jwtHeader, AuthController.authenticateToken, (req, res) => {
      const { user } = req;
      const userData = {
        username: user.username,
        displayName: user.displayName,
        createdOn: user.createdOn,
        updatedOn: user.updatedOn,
      };

      return res.success('user successfully authenticated via token', { user: userData });
    });
};
