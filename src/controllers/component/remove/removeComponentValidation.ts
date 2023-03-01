import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveComponentValidation = (
  confirm: unknown,
  expectedValue: string,
) => string | void;

const removeComponentValidation: RemoveComponentValidation = (confirm, expectedValue) => {
  return confirmationValidation(confirm, expectedValue);
};

export default removeComponentValidation;
