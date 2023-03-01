import { Blueprint, Project } from 'src/models';
import { ComponentContent } from 'src/models';
import {
  validateBlueprintId,
  validateContent,
} from 'src/controllers/component/validation_utils';
import { resourceNameValidation as validateName } from 'src/controllers/validation_utils';

type CreateComponentValidation = (
  project: Project,
  name: unknown,
  contentInput: unknown,
  blueprintId: unknown,
) => Promise<{
  validationError?: string;
  blueprint?: Blueprint;
  content: ComponentContent;
}>;

const createComponentValidation: CreateComponentValidation = async (
  project,
  name,
  contentInput,
  blueprintId,
) => {
  const nameError = validateName(name);
  if (nameError) {
    return { validationError: nameError, content: {} };
  }

  const { validationError: blueprintIdError, blueprint } = await validateBlueprintId(
    project,
    blueprintId,
  );
  if (blueprintIdError) {
    return { validationError: blueprintIdError, content: {} };
  }

  const { validationError: contentError, content } = validateContent(
    blueprint?.fields || [],
    contentInput,
  );
  if (contentError) {
    return { validationError: contentError, content: {} };
  }

  if (Object.keys(content).length === 0) {
    return { validationError: 'content contains no valid fields', content: {} };
  }

  return { blueprint, content };
};

export default createComponentValidation;
