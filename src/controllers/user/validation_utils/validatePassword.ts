export const validatePassword = async (password: unknown) => {
  if (password === null || password === undefined) {
    return 'password is missing from input';
  }

  if (typeof password !== 'string') {
    return 'password must be a string';
  }

  if (password.length < 8) {
    return 'password must be at least 8 characters in length';
  }

  const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$');
  if (!regex.test(password)) {
    return 'password must have 1 uppercase, lowercase, and number character';
  }
};
