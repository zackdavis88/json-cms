/*
  fieldType STRING
  Strings can have the following options to validate against:
  1. regex
  2. min
  3. max
*/

interface StringOptions {
  regex?: string;
  min?: number;
  max?: number;
}

type ValidateStringContent = (
  contentValue: unknown,
  fieldName: string,
  parentFieldName: string,
  options: StringOptions,
) => void | string;

const validateStringContent: ValidateStringContent = (
  contentValue,
  fieldName,
  parentFieldName,
  options,
) => {
  if (typeof contentValue !== 'string') {
    return `${parentFieldName} field '${fieldName}' must be a string`;
  }

  const regexObject = options.regex ? new RegExp(options.regex) : null;
  if (regexObject && !regexObject.test(contentValue)) {
    return `${parentFieldName} field '${fieldName}' must match the blueprint regex /${options.regex}/`;
  }

  if (typeof options.min === 'number' && contentValue.length < options.min) {
    return `${parentFieldName} field '${fieldName}' must have a minimum length of ${options.min}`;
  }

  if (typeof options.max === 'number' && contentValue.length > options.max) {
    return `${parentFieldName} field '${fieldName}' must have a maximum length of ${options.max}`;
  }
};

export default validateStringContent;
