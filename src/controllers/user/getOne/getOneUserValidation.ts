import { User } from 'src/models';

type GetOneUserValidation = (username: string) => Promise<string | User>;

const getOneUserValidation: GetOneUserValidation = async (username) => {
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

export default getOneUserValidation;
