import {
  validateUsername,
  validatePassword,
} from 'src/controllers/user/validation_utils';

type CreateUserValidation = (
  username: unknown,
  password: unknown,
) => Promise<string | void>;

const createUserValidation: CreateUserValidation = async (username, password) => {
  const usernameError = await validateUsername(username);
  if (usernameError) {
    return usernameError;
  }

  const passwordError = await validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
};

export default createUserValidation;
