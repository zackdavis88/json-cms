import { validatePassword } from 'src/controllers/user/validation_utils';

type UpdateUserValidation = (password: unknown) => Promise<string | void>;

const updateUserValidation: UpdateUserValidation = async (password) => {
  const passwordError = await validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
};

export default updateUserValidation;
