import {
  validateName,
  validateDescription,
} from 'src/controllers/project/validation_utils';

type CreateProjectValidation = (name: unknown, description: unknown) => string | void;

const createProjectValidation: CreateProjectValidation = (name, description) => {
  const nameValidationError = validateName(name);
  if (nameValidationError) {
    return nameValidationError;
  }

  const descriptionValidationError = validateDescription(description);
  if (descriptionValidationError) {
    return descriptionValidationError;
  }
};

export default createProjectValidation;
