import { Blueprint, Project } from 'src/models';
import { uuidValidation } from 'src/controllers/validation_utils';

type ValidateBlueprintId = (
  project: Project,
  blueprintId: unknown,
) => Promise<{ validationError?: string; blueprint?: Blueprint }>;

export const validateBlueprintId: ValidateBlueprintId = async (project, blueprintId) => {
  if (blueprintId === null || blueprintId === undefined) {
    return { validationError: 'blueprintId is missing from input' };
  }

  if (typeof blueprintId !== 'string') {
    return { validationError: 'blueprintId must be a string' };
  }

  if (uuidValidation(blueprintId, 'blueprint')) {
    return { validationError: 'blueprintId is not valid' };
  }

  const blueprint = (
    await project.getBlueprints({
      where: { id: blueprintId, isActive: true },
    })
  )[0];

  if (!blueprint) {
    return { validationError: 'blueprint not found' };
  }

  return { blueprint };
};
