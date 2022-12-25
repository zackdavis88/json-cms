import { BlueprintField } from 'src/models/blueprint';
import { validateName, validateFields } from 'src/controllers/blueprint/validation_utils';

type UpdateBlueprintValidation = (
  name: unknown,
  fields: unknown,
) => {
  validationError?: string;
  fields: BlueprintField[];
};

const updateBlueprintValidation: UpdateBlueprintValidation = (name, fields) => {
  if (name === undefined && fields === undefined) {
    return { validationError: 'input contains no update data', fields: [] };
  }

  const nameError = validateName(name, true);
  if (nameError) {
    return { validationError: nameError, fields: [] };
  }

  const { fieldsError, fields: validatedFields } = validateFields(fields, true);
  if (fieldsError) {
    return { validationError: fieldsError, fields: [] };
  }

  return { fields: validatedFields };
};

export default updateBlueprintValidation;
