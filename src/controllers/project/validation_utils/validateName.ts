type ValidateName = (name: unknown, isOptional?: boolean) => string | void;

export const validateName: ValidateName = (name, isOptional = false) => {
  if (isOptional && (name === undefined || name === null)) {
    return;
  }

  if (name === undefined || name === null) {
    return 'name is missing from input';
  }

  if (typeof name !== 'string') {
    return 'name must be a string';
  }

  if (name.length < 3 || name.length > 30) {
    return 'name must be 3 - 30 characters in length';
  }

  const regex = new RegExp('^[A-Za-z0-9-_+=&^%$#*@!|/(){}?.,<>;\':" ]+$');
  if (!regex.test(name)) {
    return 'name contains invalid characters';
  }
};
