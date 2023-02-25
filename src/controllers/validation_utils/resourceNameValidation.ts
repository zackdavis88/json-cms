type ResourceNameValidation = (name: unknown, isOptional?: boolean) => string | void;

export const resourceNameValidation: ResourceNameValidation = (
  name,
  isOptional = false,
) => {
  if (isOptional && (name === undefined || name === null)) {
    return;
  }

  if (name === undefined || name === null) {
    return 'name is missing from input';
  }

  if (typeof name !== 'string') {
    return 'name must be a string';
  }

  if (name.length < 1 || name.length > 100) {
    return 'name must be 1 - 100 characters in length';
  }

  const regex = new RegExp('^[A-Za-z0-9-_+=&^%$#*@!|/(){}?.,<>;\':" ]+$');
  if (!regex.test(name)) {
    return 'name contains invalid characters';
  }
};
