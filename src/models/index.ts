import { Sequelize } from 'sequelize';
import { initializeUser } from './user';

export { User } from './user';
export const initializeModels = async (sequelize: Sequelize) => {
  initializeUser(sequelize);

  try {
    await sequelize.sync();
  } catch (error) {
    console.error('Error synchronizing models');
    console.error(error);
    throw error;
  }
};
