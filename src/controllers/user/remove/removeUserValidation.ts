import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveUserValidation = (confirm: unknown, expectedValue: string) => string | void;

const removeUserValidation: RemoveUserValidation = (confirm, expectedValue) => {
  return confirmationValidation(confirm, expectedValue);
};

export default removeUserValidation;
