import { BlueprintField, ComponentContent } from 'src/models';
import { validateContent } from 'src/controllers/component/validation_utils';
import { resourceNameValidation as validateName } from 'src/controllers/validation_utils';

type UpdateComponentValidation = (
  name: unknown,
  contentInput: unknown,
  blueprintFields: BlueprintField['fields'],
) => {
  validationError?: string;
  content: ComponentContent;
};

const updateComponentValidation: UpdateComponentValidation = (
  name,
  contentInput,
  blueprintFields,
) => {
  if (name === undefined && contentInput === undefined) {
    return { validationError: 'input contains no update data', content: {} };
  }

  const nameError = validateName(name, true);
  if (nameError) {
    return { validationError: nameError, content: {} };
  }

  const { validationError: contentError, content } = validateContent(
    blueprintFields || [],
    contentInput,
    true,
  );
  if (contentError) {
    return { validationError: contentError, content: {} };
  }

  if (Object.keys(content).length === 0) {
    return { validationError: 'content contains no valid fields', content: {} };
  }

  return { content };
};

export default updateComponentValidation;
