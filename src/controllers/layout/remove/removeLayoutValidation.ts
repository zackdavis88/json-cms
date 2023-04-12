import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveLayoutValidation = (confirm: unknown, expectedValue: string) => string | void;

const removeLayoutValidation: RemoveLayoutValidation = (confirm, expectedValue) => {
  return confirmationValidation(confirm, expectedValue);
};

export default removeLayoutValidation;
