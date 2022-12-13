import {
  validateName,
  validateDescription,
} from 'src/controllers/project/validation_utils';

type UpdateProjectValidation = (name: unknown, description: unknown) => string | void;

const updateProjectValidation: UpdateProjectValidation = (name, description) => {
  if (name === undefined && description === undefined) {
    return 'input contains no update data';
  }

  const nameValidationError = validateName(name, true);
  if (nameValidationError) {
    return nameValidationError;
  }

  const descriptionValidationError = validateDescription(description);
  if (descriptionValidationError) {
    return descriptionValidationError;
  }
};

export default updateProjectValidation;
