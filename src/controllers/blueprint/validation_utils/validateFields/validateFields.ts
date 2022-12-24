import { BlueprintField } from 'src/models/blueprint';
import reduceFields from './reduceFields';

type ValidateFields = (
  fields: unknown,
  isOptional?: boolean,
) => {
  fieldsError?: string;
  fields: BlueprintField[];
};

const validateFields: ValidateFields = (fields, isOptional = false) => {
  if (isOptional && (fields === null || fields === undefined)) {
    return { fields: [] };
  }

  if (fields === null || fields === undefined) {
    return { fieldsError: 'fields is missing from input', fields: [] };
  }

  if (!Array.isArray(fields)) {
    return {
      fieldsError: 'fields must be an array of field objects',
      fields: [],
    };
  }

  if (!fields.length) {
    return {
      fieldsError: 'fields must contain at least 1 field object',
      fields: [],
    };
  }

  return reduceFields(fields);
};

export default validateFields;
