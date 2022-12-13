type ValidateDescription = (description: unknown) => string | void;

export const validateDescription: ValidateDescription = (description) => {
  if (description === undefined || description === null) {
    return;
  }

  if (typeof description !== 'string') {
    return 'description must be a string';
  }

  if (description.length > 350) {
    return 'description must be 350 characters or less';
  }
};
