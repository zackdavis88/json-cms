import { Sequelize } from 'sequelize';
import { initializeUser } from './user';

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
};

export const initializeModelsAndSync = async (sequelize: Sequelize) => {
  initializeModels(sequelize);
  await synchronizeTables(sequelize);
};

export { User } from './user';
