import { resourceNameValidation as validateName } from 'src/controllers/validation_utils';
import { validateComponentOrder } from 'src/controllers/layout/validation_utils';
import { Component } from 'src/models';

type CreateLayoutValidation = (
  name: unknown,
  componentOrder: unknown,
) => Promise<{
  validationError?: string;
  components: Component[];
}>;

const createLayoutValidation: CreateLayoutValidation = async (name, componentOrder) => {
  const nameError = validateName(name);
  if (nameError) {
    return { validationError: nameError, components: [] };
  }

  return await validateComponentOrder(componentOrder);
};

export default createLayoutValidation;
