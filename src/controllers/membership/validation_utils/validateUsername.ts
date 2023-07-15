import { User } from 'src/models';

type ValidateUsername = (username: unknown) => Promise<User | string>;

export const validateUsername: ValidateUsername = async (username) => {
  if (username === null || username === undefined) {
    return 'username is missing from input';
  }

  if (typeof username !== 'string') {
    return 'username must be a string';
  }

  const user = await User.findOne({
    where: {
      username: username.toLowerCase(),
      isActive: true,
    },
  });

  if (!user) {
    return 'requested user not found';
  }

  return user;
};
