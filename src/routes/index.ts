import { Router } from 'express';
import { userRoutes } from './user';

export const configureRoutes = (router: Router) => {
  userRoutes(router);
};
