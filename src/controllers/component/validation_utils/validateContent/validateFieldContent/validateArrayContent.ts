import { BlueprintField, FieldTypes, Component } from 'src/models';
import validateStringContent from './validateStringContent';
import validateBooleanContent from './validateBooleanContent';
import validateNumberContent from './validateNumberContent';
import validateDateContent from './validateDateContent';
import reduceContent from 'src/controllers/component/validation_utils/validateContent/reduceContent';

interface ReduceArrayContentOutput {
  validationError?: string;
  content: unknown[];
}

type ReduceArrayContent = (
  arrayOf: BlueprintField,
  arrayContent: unknown[],
  fieldName: string,
) => ReduceArrayContentOutput;

export const validateArrayContent: ReduceArrayContent = (
  arrayOf,
  arrayContent,
  fieldName,
) => {
  return arrayContent.reduce<ReduceArrayContentOutput>(
    (prev, arrayField) => {
      if (prev.validationError) {
        return prev;
      }

      if (arrayField === null || arrayField === undefined) {
        return prev;
      }

      const { type, fields, regex, min, max, isInteger } = arrayOf;
      if (type === FieldTypes.STRING) {
        const validationError = validateStringContent(
          arrayField,
          'item',
          `${fieldName} array`,
          { regex, min, max },
        );

        if (validationError) {
          return { ...prev, validationError };
        }

        return { ...prev, content: [...prev.content, arrayField] };
      }

      if (type === FieldTypes.BOOLEAN) {
        const validationError = validateBooleanContent(
          arrayField,
          'item',
          `${fieldName} array`,
        );

        if (validationError) {
          return { ...prev, validationError };
        }

        return { ...prev, content: [...prev.content, arrayField] };
      }

      if (type === FieldTypes.NUMBER) {
        const validationError = validateNumberContent(
          arrayField,
          'item',
          `${fieldName} array`,
          {
            isInteger,
            min,
            max,
          },
        );

        if (validationError) {
          return { ...prev, validationError };
        }

        return { ...prev, content: [...prev.content, arrayField] };
      }

      if (type === FieldTypes.DATE) {
        const validationError = validateDateContent(
          arrayField,
          'item',
          `${fieldName} array`,
        );

        if (validationError) {
          return { ...prev, validationError };
        }

        return {
          ...prev,
          content: [...prev.content, arrayField],
        };
      }

      if (type === FieldTypes.OBJECT && fields) {
        if (typeof arrayField !== 'object' || Array.isArray(arrayField)) {
          return {
            ...prev,
            validationError: `${fieldName} array field 'item' must be an object`,
          };
        }

        const { validationError, content } = reduceContent(
          fields,
          arrayField as Component['content'],
          `${fieldName} array`,
        );

        if (validationError) {
          return { ...prev, validationError };
        }

        return { ...prev, content: [...prev.content, content] };
      }

      return prev;
    },
    { validationError: undefined, content: [] },
  );
};

export default validateArrayContent;
