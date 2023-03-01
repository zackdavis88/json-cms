/*
  fieldType DATE
  Dates must be valid timestamps strings.
*/

type ValidateDateContent = (
  contentValue: unknown,
  fieldName: string,
  parentFieldName: string,
) => void | string;

const validateDateContent: ValidateDateContent = (
  contentValue,
  fieldName,
  parentFieldName,
) => {
  if (typeof contentValue !== 'string') {
    return `${parentFieldName} field '${fieldName}' must be a timestamp string`;
  }

  const dateObject = new Date(contentValue);
  if (dateObject.toString() === 'Invalid Date') {
    return `${parentFieldName} field '${fieldName}' must be a valid date`;
  }
};

export default validateDateContent;
