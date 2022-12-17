import { Sequelize } from 'sequelize';
import { User, initializeUser } from './user';
import { Project, initializeProject } from './project';
import { Membership, initializeMembership } from './membership';
import { Blueprint, BlueprintField, initializeBlueprint } from './blueprint';

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

  // TODO: Very early associations for Blueprints / BlueprintFields
  // The DB tables look the way I think they should..but im not sure things are working till we dig into the endpoint functionality.
  Blueprint.hasMany(BlueprintField, { as: 'fields', foreignKey: 'parentBlueprintId' });
  BlueprintField.belongsTo(Blueprint, {
    foreignKey: 'parentBlueprintId',
    as: 'blueprint',
  });

  User.hasMany(Blueprint, { as: 'createdBlueprints', foreignKey: 'createdById' });
  Blueprint.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

  User.hasMany(Blueprint, { as: 'updatedBlueprints', foreignKey: 'updatedById' });
  Blueprint.belongsTo(User, { as: 'updatedBy', foreignKey: 'updatedById' });

  User.hasMany(Blueprint, { as: 'deletedBlueprints', foreignKey: 'deletedById' });
  Blueprint.belongsTo(User, { as: 'deletedBy', foreignKey: 'deletedById' });

  BlueprintField.hasMany(BlueprintField, { as: 'fields', foreignKey: 'parentFieldId' });
  BlueprintField.belongsTo(BlueprintField, {
    as: 'parentField',
    foreignKey: 'parentFieldId',
  });

  BlueprintField.hasOne(BlueprintField, { as: 'arrayOf', foreignKey: 'arrayOfId' });
  BlueprintField.belongsTo(BlueprintField, {
    as: 'arrayOfParent',
    foreignKey: 'arrayOfId',
  });
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
export { Project } from './project';
export { Membership } from './membership';
