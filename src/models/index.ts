import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';
import {
  Blueprint,
  initializeBlueprint,
  BlueprintField as _BlueprintField,
} from './blueprint';

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
  initializeBlueprint(sequelize);

  // Sequelize is weird. These associations need to be done outside of the model files
  // and after model initialization because of our code structure.
  User.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Project.hasMany(Membership, {
    as: 'memberships',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Membership.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'project',
  });

  User.hasMany(Blueprint, { as: 'createdBlueprints', foreignKey: 'createdById' });
  Blueprint.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Blueprint, { as: 'updatedBlueprints', foreignKey: 'updatedById' });
  Blueprint.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });

  User.hasMany(Blueprint, { as: 'deletedBlueprints', foreignKey: 'deletedById' });
  Blueprint.belongsTo(User, { as: 'deletedBy', foreignKey: 'deletedById' });

  Project.hasMany(Blueprint, { as: 'blueprints', foreignKey: 'projectId' });
  Blueprint.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
export { Membership } from './membership';
export { Blueprint, FieldTypes } from './blueprint';
export type BlueprintField = _BlueprintField;
