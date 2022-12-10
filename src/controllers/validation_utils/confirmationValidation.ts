type ConfirmationValidation = (
  confirmInput: unknown,
  expectedValue: unknown,
) => string | void;

export const confirmationValidation: ConfirmationValidation = (
  confirmInput,
  expectedValue,
) => {
  if (confirmInput === undefined || confirmInput === null) {
    return 'confirm is missing from input';
  }

  const expectedType = typeof expectedValue;
  if (typeof confirmInput !== expectedType) {
    return `confirm input must be a ${expectedType.toLowerCase()}`;
  }

  if (confirmInput !== expectedValue) {
    return `confirm input must have a value of ${expectedValue}`;
  }
};
