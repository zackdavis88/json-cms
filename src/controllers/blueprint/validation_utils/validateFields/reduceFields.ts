import { BlueprintField, FieldTypes } from 'src/models/blueprint';
import { Utils, UUIDV4 } from 'sequelize';

type ReduceFieldsOutput = {
  fieldsError?: string;
  fields: BlueprintField[];
};

type ReduceFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[],
  parentFieldName?: string,
) => ReduceFieldsOutput;

/*
  Welcome to hell.
  
  This recursive method is responsible for:
    1. Validating the fields array contains no items with duplicate names.
    2. Validating each of the fields array items.
    3. Returning an array of ready-to-create BlueprintField objects.
*/
const reduceFields: ReduceFields = (fields, parentFieldName) => {
  // Validate that every field is an object.
  const fieldsContainsInvalidFieldObject = fields.some(
    (field) => typeof field !== 'object' || Array.isArray(field),
  );
  if (fieldsContainsInvalidFieldObject) {
    return {
      fieldsError: `${
        parentFieldName || 'blueprint'
      } fields contains a value that is not an object`,
      fields: [],
    };
  }

  // Validate that fields does not contain duplicate field.name entries.
  const fieldNames = fields.map((field) => {
    if (typeof field === 'object' && field.name) {
      return field.name;
    }

    return '';
  });
  let duplicateFieldName = '';
  const hasDuplicate = fieldNames.some((fieldName) => {
    const isDuplicate =
      fieldNames.indexOf(fieldName) !== fieldNames.lastIndexOf(fieldName);
    if (isDuplicate) {
      duplicateFieldName = fieldName;
    }
    return isDuplicate;
  });
  if (hasDuplicate) {
    return {
      fieldsError: `${
        parentFieldName || 'blueprint'
      } fields contains duplicate name value: ${duplicateFieldName}`,
      fields: [],
    };
  }

  return fields.reduce<ReduceFieldsOutput>(
    (prev, field) => {
      if (prev.fieldsError) {
        return prev;
      }

      const {
        type,
        name,
        isRequired,
        isInteger,
        regex,
        min,
        max,
        arrayOf,
        fields: childrenFields,
      } = field;

      // Validate that field.type is present.
      if (type === null || type === undefined) {
        return {
          ...prev,
          fieldsError: `${parentFieldName || 'blueprint'} field object type is missing`,
        };
      }

      // Validate that field.type is a string.
      if (typeof type !== 'string') {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object type must be a string`,
        };
      }

      // Validate that field.type is a valid FieldTypes.
      if (Object.keys(FieldTypes).indexOf(type.toUpperCase()) === -1) {
        return {
          ...prev,
          fieldsError: `${parentFieldName || 'blueprint'} field object type is invalid`,
        };
      }

      // Validate that field.name is present.
      if (name === null || name === undefined) {
        return {
          ...prev,
          fieldsError: `${parentFieldName || 'blueprint'} field object name is missing`,
        };
      }

      // Validate that field.name is a string.
      if (typeof name !== 'string') {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object name must be a string`,
        };
      }

      // Validate that field.name is a valid length.
      if (name.length < 1 || name.length > 100) {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object name must be 1 - 100 characters in length`,
        };
      }

      // Validate that field.name does not contain invalid characters.
      // eslint-disable-next-line quotes
      const nameRegex = new RegExp("^[A-Za-z0-9-_+=&^%$#*@!|(){}?.,<>;': ]+$");
      if (!nameRegex.test(name)) {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object name contains invalid characters`,
        };
      }

      // Validate that field.isRequired is a boolean if present.

      if (
        isRequired !== null &&
        isRequired !== undefined &&
        typeof isRequired !== 'boolean'
      ) {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object isRequired must be a boolean`,
        };
      }

      // Validate that field.isInteger is a boolean if present.
      if (
        isInteger !== null &&
        isInteger !== undefined &&
        typeof isInteger !== 'boolean'
      ) {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object isInteger must be a boolean`,
        };
      }

      // Validate that field.regex is a string if present.
      if (regex !== null && regex !== undefined && typeof regex !== 'string') {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object regex must be a string`,
        };
      }

      // Validate that field.min is a number if present.
      if (min !== null && min !== undefined && typeof min !== 'number') {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object min must be a number`,
        };
      }

      // Validate that field.max is a number if present.
      if (max !== null && max !== undefined && typeof max !== 'number') {
        return {
          ...prev,
          fieldsError: `${
            parentFieldName || 'blueprint'
          } field object max must be a number`,
        };
      }

      // ARRAY specific validation and recursion.
      if (type.toUpperCase() === FieldTypes.ARRAY) {
        // const arrayFieldId = String(Utils.toDefaultValue(UUIDV4()));
        if (arrayOf === null || arrayOf === undefined) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object contains an ARRAY type without arrayOf`,
          };
        }

        if (typeof arrayOf !== 'object' || Array.isArray(arrayOf)) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object arrayOf must be a field object`,
          };
        }

        if (
          arrayOf.type &&
          typeof arrayOf.type === 'string' &&
          arrayOf.type === FieldTypes.ARRAY
        ) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object arrayOf can not contain an ARRAY type`,
          };
        }

        const { fieldsError, fields } = reduceFields([arrayOf], name);
        if (fieldsError) {
          return { ...prev, fieldsError };
        }

        return {
          ...prev,
          fields: [
            ...prev.fields,
            {
              id: String(Utils.toDefaultValue(UUIDV4())),
              name,
              type: FieldTypes.ARRAY,
              isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
              min: typeof min === 'number' ? min : undefined,
              max: typeof max === 'number' ? max : undefined,
              arrayOf: fields[0],
            },
          ],
        };
      } else if (type.toUpperCase() === FieldTypes.OBJECT) {
        if (childrenFields === null || childrenFields === undefined) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object contains an OBJECT type without fields`,
          };
        }

        if (!Array.isArray(childrenFields)) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object fields must be an array of field objects`,
          };
        }

        if (!childrenFields.length) {
          return {
            ...prev,
            fieldsError: `${
              parentFieldName || 'blueprint'
            } field object contains an OBJECT type with an empty fields array`,
          };
        }

        const { fieldsError, fields } = reduceFields(childrenFields, name);
        if (fieldsError) {
          return { ...prev, fieldsError };
        }

        return {
          ...prev,
          fields: [
            ...prev.fields,
            {
              id: String(Utils.toDefaultValue(UUIDV4())),
              name,
              type: FieldTypes.OBJECT,
              isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
              fields,
            },
          ],
        };
      }

      return {
        ...prev,
        fields: [
          ...prev.fields,
          {
            id: String(Utils.toDefaultValue(UUIDV4())),
            name,
            type: type.toUpperCase(),
            isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
            isInteger: typeof isInteger === 'boolean' ? isInteger : undefined,
            regex: typeof regex === 'string' ? regex : undefined,
            min: typeof min === 'number' ? min : undefined,
            max: typeof max === 'number' ? max : undefined,
          },
        ],
      };
    },
    {
      fieldsError: '',
      fields: [],
    },
  );
};

export default reduceFields;
