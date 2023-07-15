/*
  fieldType BOOLEAN
  Booleans have no additional options to validate against.
*/

type ValidateBooleanContent = (
  contentValue: unknown,
  fieldName: string,
  parentFieldName: string,
) => void | string;

const validateBooleanContent: ValidateBooleanContent = (
  contentValue,
  fieldName,
  parentFieldName,
) => {
  if (typeof contentValue !== 'boolean') {
    return `${parentFieldName} field '${fieldName}' must be a boolean`;
  }
};

export default validateBooleanContent;
