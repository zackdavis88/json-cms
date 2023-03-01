import { Router } from 'express';
import { userRoutes } from './user';
import { authRoutes } from './auth';
import { projectRoutes } from './project';
import { membershipRoutes } from './membership';
import { blueprintRoutes } from './blueprint';
import { componentRoutes } from './component';

export const configureRoutes = (router: Router) => {
  authRoutes(router);
  userRoutes(router);
  projectRoutes(router);
  membershipRoutes(router);
  blueprintRoutes(router);
  componentRoutes(router);
};
