import { Router } from 'express';
import { userRoutes } from './user';
import { authRoutes } from './auth';
import { projectRoutes } from './project';

export const configureRoutes = (router: Router) => {
  authRoutes(router);
  userRoutes(router);
  projectRoutes(router);
};
