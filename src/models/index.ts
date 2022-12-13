import { Sequelize } from 'sequelize';
import { initializeUser } from './user';
import { initializeProject } from './project';
import { initializeMembership } from './membership';
import { User } from './user';
import { Project } from './project';
import { Membership } from './membership';

const synchronizeTables = async (sequelize: Sequelize) => {
  try {
    await sequelize.sync();
  } catch (error) {
    console.error('Error synchronizing models');
    console.error(error);
    throw error;
  }
};

export const initializeModels = (sequelize: Sequelize) => {
  initializeUser(sequelize);
  initializeProject(sequelize);
  initializeMembership(sequelize);

  // Sequelize is weird. These associations need to be done outside of the model files
  // and after model initialization because of our code structure.
  User.hasMany(Membership, { as: 'memberships', foreignKey: 'userId' });
  Membership.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Project.hasMany(Membership, { as: 'memberships', foreignKey: 'projectId' });
  Membership.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'project',
  });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
export { Membership } from './membership';
