import { resourceNameValidation as validateName } from 'src/controllers/validation_utils';
import { validateComponentOrder } from 'src/controllers/layout/validation_utils';
import { Component } from 'src/models';

type UpdateLayoutValidation = (
  name: unknown,
  componentOrder: unknown,
) => Promise<{
  validationError?: string;
  components: Component[];
}>;

const updateLayoutValidation: UpdateLayoutValidation = async (name, componentOrder) => {
  if (name === undefined && componentOrder === undefined) {
    return { validationError: 'input contains no update data', components: [] };
  }

  const nameError = validateName(name, true);
  if (nameError) {
    return { validationError: nameError, components: [] };
  }

  return await validateComponentOrder(componentOrder);
};

export default updateLayoutValidation;
