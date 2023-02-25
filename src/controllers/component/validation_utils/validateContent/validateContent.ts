import { Blueprint, Component } from 'src/models';
import reduceContent from './reduceContent';

type ValidateContent = (
  blueprintFields: Blueprint['fields'],
  content: unknown,
) => { validationError?: string; content: Component['content'] };

const validateContent: ValidateContent = (
  blueprintFields,
  content,
  isOptional = false,
) => {
  if (isOptional && (content === undefined || content === null)) {
    return { content: {} };
  }

  if (content === undefined || content === null) {
    return { validationError: 'content is missing from input', content: {} };
  }

  if (typeof content !== 'object' || Array.isArray(content)) {
    return {
      validationError:
        'content must be an object of key/values following the blueprint fields',
      content: {},
    };
  }

  return reduceContent(blueprintFields, content as Component['content']);
};

export default validateContent;
