import { User } from 'src/models';
import { BaseError } from 'sequelize';

export const validateUsername = async (username: unknown) => {
  if (username === null || username === undefined) {
    return 'username is missing from input';
  }

  if (typeof username !== 'string') {
    return 'username must be a string';
  }

  if (username.length < 3 || username.length > 30) {
    return 'username must be 3 - 30 characters in length';
  }

  const regex = new RegExp('^[A-Za-z0-9-_]+$');
  if (!regex.test(username)) {
    return 'username may only contain alphanumeric, - (dash), and _ (underscore) characters';
  }

  try {
    const existingUser = await User.findOne({
      where: {
        username: username.toLowerCase(),
        isActive: true,
      },
    });

    if (existingUser) {
      return 'username is already taken';
    }
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
  }
};
