import { Blueprint, Component, FieldTypes } from 'src/models';
import {
  validateStringContent,
  validateBooleanContent,
  validateNumberContent,
  validateDateContent,
  validateArrayContent,
} from './validateFieldContent';

type ReduceContentOutput = {
  validationError?: string;
  content: Component['content'];
};

type ReduceContent = (
  fields: Blueprint['fields'],
  content: Component['content'],
  parentFieldName?: string,
) => ReduceContentOutput;

const reduceContent: ReduceContent = (fields, content, parentFieldName) => {
  return fields.reduce<ReduceContentOutput>(
    (prev, field) => {
      if (prev.validationError) {
        return prev;
      }

      const {
        name: fieldName,
        type: fieldType,
        fields: childrenFields,
        arrayOf,
        isRequired,
        regex,
        isInteger,
        min,
        max,
      } = field;
      const contentValue: unknown = content[fieldName];

      if (isRequired && (contentValue === null || contentValue === undefined)) {
        return {
          content: {},
          validationError: `${
            parentFieldName || 'content'
          } field '${fieldName}' is a required ${fieldType.toLowerCase()}`,
        };
      } else if (!isRequired && (contentValue === null || contentValue === undefined)) {
        return prev;
      }

      if (fieldType === FieldTypes.STRING) {
        const stringFieldError = validateStringContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
          { regex, min, max },
        );
        if (stringFieldError) {
          return { ...prev, validationError: stringFieldError };
        }
        return {
          ...prev,
          content: { ...prev.content, [fieldName]: contentValue },
        };
      }

      if (fieldType === FieldTypes.BOOLEAN) {
        const booleanFieldError = validateBooleanContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
        );
        if (booleanFieldError) {
          return { ...prev, validationError: booleanFieldError };
        }

        return {
          ...prev,
          content: { ...prev.content, [fieldName]: contentValue },
        };
      }

      if (fieldType === FieldTypes.NUMBER) {
        const numberFieldError = validateNumberContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
          { isInteger, min, max },
        );
        if (numberFieldError) {
          return { ...prev, validationError: numberFieldError };
        }

        return {
          ...prev,
          content: { ...prev.content, [fieldName]: contentValue },
        };
      }

      if (fieldType === FieldTypes.DATE) {
        const dateFieldError = validateDateContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
        );
        if (dateFieldError) {
          return { ...prev, validationError: dateFieldError };
        }

        return {
          ...prev,
          content: {
            ...prev.content,
            [fieldName]: contentValue,
          },
        };
      }

      if (fieldType === FieldTypes.OBJECT && childrenFields) {
        /*
          fieldType OBJECT
          Objects have no additional options to validate against but they must have their children fields validated.
        */
        if (
          !contentValue ||
          typeof contentValue !== 'object' ||
          Array.isArray(contentValue)
        ) {
          return {
            ...prev,
            validationError: `${
              parentFieldName || 'content'
            } field '${fieldName}' must be an object`,
          };
        }

        const { validationError: childFieldsError, content } = reduceContent(
          childrenFields,
          contentValue as Component['content'],
          fieldName,
        );
        if (childFieldsError) {
          return { ...prev, validationError: childFieldsError };
        }

        return {
          ...prev,
          content: { ...prev.content, [fieldName]: content },
        };
      }

      if (fieldType === FieldTypes.ARRAY && arrayOf) {
        if (!Array.isArray(contentValue)) {
          return {
            ...prev,
            validationError: `${
              parentFieldName || 'content'
            } field '${fieldName}' must be an array`,
          };
        }

        if (typeof min === 'number' && contentValue.length < min) {
          return {
            ...prev,
            validationError: `${
              parentFieldName || 'content'
            } field '${fieldName}' must have a minimum length of ${min}`,
          };
        }

        if (typeof max === 'number' && contentValue.length > max) {
          return {
            ...prev,
            validationError: `${
              parentFieldName || 'content'
            } field '${fieldName}' must have a maximum length of ${max}`,
          };
        }

        const { validationError: arrayFieldError, content } = validateArrayContent(
          arrayOf,
          contentValue,
          fieldName,
        );

        if (arrayFieldError) {
          return { ...prev, validationError: arrayFieldError };
        }

        return {
          ...prev,
          content: { ...prev.content, [fieldName]: content },
        };
      }

      return prev;
    },
    {
      validationError: undefined,
      content: {},
    },
  );
};

export default reduceContent;
