import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveProjectValidation = (confirm: unknown, expectedValue: string) => string | void;

const removeProjectValidation: RemoveProjectValidation = (confirm, expectedValue) => {
  return confirmationValidation(confirm, expectedValue);
};

export default removeProjectValidation;
