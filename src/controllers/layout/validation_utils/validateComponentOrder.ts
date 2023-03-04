import { Component } from 'src/models';
import { Op } from 'sequelize';
import { uuidValidation } from 'src/controllers/validation_utils';

type ValidateComponentOrder = (componentOrder: unknown) => Promise<{
  validationError?: string;
  components: Component[];
}>;

const validateComponentOrder: ValidateComponentOrder = async (componentOrder) => {
  if (componentOrder) {
    if (!Array.isArray(componentOrder)) {
      return {
        validationError: 'componentOrder must be an array of component ids',
        components: [],
      };
    }

    const componentIdError = componentOrder.reduce<string | undefined>(
      (prev, componentId) => {
        if (prev) {
          return prev;
        }

        if (typeof componentId !== 'string') {
          return 'componentOrder contains a componentId that is not a string';
        }

        if (uuidValidation(componentId, 'componentId')) {
          return 'componentOrder contains a componentId that is not valid';
        }

        return prev;
      },
      undefined,
    );
    if (componentIdError) {
      return { validationError: componentIdError, components: [] };
    }

    const components = await Component.findAll({
      where: { id: { [Op.in]: componentOrder }, isActive: true },
    });
    if (components.length !== componentOrder.length) {
      return {
        validationError: 'componentOrder contains a component that was not found',
        components: [],
      };
    }

    return { components };
  }

  return { components: [] };
};

export default validateComponentOrder;
