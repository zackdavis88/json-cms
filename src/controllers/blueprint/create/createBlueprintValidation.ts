import { BlueprintField } from 'src/models/blueprint';
import { validateName, validateFields } from 'src/controllers/blueprint/validation_utils';

type CreateBlueprintValidation = (
  name: unknown,
  fields: unknown,
) => {
  validationError?: string;
  fields: BlueprintField[];
};

const createBlueprintValidation: CreateBlueprintValidation = (name, fields) => {
  const nameError = validateName(name);
  if (nameError) {
    return { validationError: nameError, fields: [] };
  }

  const { fieldsError, fields: validatedFields } = validateFields(fields);
  if (fieldsError) {
    return { validationError: fieldsError, fields: [] };
  }

  return { fields: validatedFields };
};

export default createBlueprintValidation;
