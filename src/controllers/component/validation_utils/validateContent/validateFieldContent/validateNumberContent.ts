/*
  fieldType NUMBER
  Strings can have the following options to validate against:
  1. isInteger
  2. min
  3. max
*/

interface NumberOptions {
  isInteger?: boolean;
  min?: number;
  max?: number;
}

type ValidateNumberContent = (
  contentValue: unknown,
  fieldName: string,
  parentFieldName: string,
  options: NumberOptions,
) => void | string;

const validateNumberContent: ValidateNumberContent = (
  contentValue,
  fieldName,
  parentFieldName,
  options,
) => {
  if (typeof contentValue !== 'number') {
    return `${parentFieldName} field '${fieldName}' must be a number`;
  }

  if (options.isInteger && !Number.isInteger(contentValue)) {
    return `${parentFieldName} field '${fieldName}' must be an integer`;
  }

  if (typeof options.min === 'number' && contentValue < options.min) {
    return `${parentFieldName} field '${fieldName}' must have a minimum value of ${options.min}`;
  }

  if (typeof options.max === 'number' && contentValue > options.max) {
    return `${parentFieldName} field '${fieldName}' must have a maximum value of ${options.max}`;
  }
};

export default validateNumberContent;
