import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveBlueprintValidation = (
  confirm: unknown,
  expectedValue: string,
) => string | void;

const removeBlueprintValidation: RemoveBlueprintValidation = (confirm, expectedValue) => {
  return confirmationValidation(confirm, expectedValue);
};

export default removeBlueprintValidation;
