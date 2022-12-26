import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';
import {
  Blueprint,
  BlueprintVersion,
  initializeBlueprint,
  BlueprintField as _BlueprintField,
} from './blueprint';
import { Component, initializeComponent } from './component';

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
  initializeComponent(sequelize);

  /*  Sequelize is weird. These associations need to be done outside of the model files
   *  and after model initialization because of our code structure.
   */
  // Membership associations
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

  // Blueprint associations
  User.hasMany(Blueprint, { as: 'createdBlueprints', foreignKey: 'createdById' });
  Blueprint.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Blueprint, { as: 'updatedBlueprints', foreignKey: 'updatedById' });
  Blueprint.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });

  User.hasMany(Blueprint, { as: 'deletedBlueprints', foreignKey: 'deletedById' });
  Blueprint.belongsTo(User, { as: 'deletedBy', foreignKey: 'deletedById' });

  Project.hasMany(Blueprint, {
    as: 'blueprints',
    foreignKey: 'projectId',
    onDelete: 'CASCADE',
  });
  Blueprint.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

  Blueprint.hasMany(BlueprintVersion, {
    as: 'versions',
    foreignKey: 'blueprintId',
    onDelete: 'CASCADE',
  });
  BlueprintVersion.belongsTo(Blueprint, { as: 'blueprint', foreignKey: 'blueprintId' });

  // Component associations
  Blueprint.hasMany(Component, {
    as: 'components',
    foreignKey: 'blueprintId',
    onDelete: 'CASCADE',
  });
  Component.belongsTo(Blueprint, { as: 'blueprint', foreignKey: 'blueprintId' });

  User.hasMany(Component, { as: 'createdComponents', foreignKey: 'createdById' });
  Component.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Component, { as: 'updatedComponents', foreignKey: 'updatedById' });
  Component.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });

  User.hasMany(Component, { as: 'deletedComponents', foreignKey: 'deletedById' });
  Component.belongsTo(User, { as: 'deletedBy', foreignKey: 'deletedById' });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
export { Membership } from './membership';
export { Blueprint, BlueprintVersion, FieldTypes } from './blueprint';
export { Component } from './component';
export type BlueprintField = _BlueprintField;
