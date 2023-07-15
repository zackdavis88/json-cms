import { BlueprintField } from 'src/models/blueprint';
import { validateFields } from 'src/controllers/blueprint/validation_utils';
import { resourceNameValidation as validateName } from 'src/controllers/validation_utils';

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
