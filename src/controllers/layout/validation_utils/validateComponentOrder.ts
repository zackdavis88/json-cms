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

    const { validationError: componentIdError, uniqueIds } = componentOrder.reduce<{
      validationError?: string;
      uniqueIds: Component['id'][];
    }>(
      (prev, componentId) => {
        if (prev.validationError) {
          return prev;
        }

        if (typeof componentId !== 'string') {
          return {
            ...prev,
            validationError: 'componentOrder contains a componentId that is not a string',
          };
        }

        if (uuidValidation(componentId, 'componentId')) {
          return {
            ...prev,
            validationError: 'componentOrder contains a componentId that is not valid',
          };
        }

        if (prev.uniqueIds.indexOf(componentId) === -1) {
          return { uniqueIds: [...prev.uniqueIds, componentId] };
        }

        return prev;
      },
      { uniqueIds: [] },
    );
    if (componentIdError) {
      return { validationError: componentIdError, components: [] };
    }

    const components = await Component.findAll({
      where: { id: { [Op.in]: uniqueIds }, isActive: true },
    });
    if (components.length !== uniqueIds.length) {
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
