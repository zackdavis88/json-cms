import { Project, User } from 'src/models';
import {
  validateUsername,
  validateRole,
} from 'src/controllers/membership/validation_utils';

type CreateMembershipValidation = (
  project: Project,
  username: unknown,
  isProjectAdmin: unknown,
  isBlueprintManager: unknown,
  isComponentManager: unknown,
  isLayoutManager: unknown,
  isFragmentManager: unknown,
) => Promise<{ validationError: string; user?: User }>;

const createMembershipValidation: CreateMembershipValidation = async (
  project,
  username,
  isProjectAdmin,
  isBlueprintManager,
  isComponentManager,
  isLayoutManager,
  isFragmentManager,
) => {
  const isProjectAdminValidationError = validateRole(isProjectAdmin, 'isProjectAdmin');
  if (isProjectAdminValidationError) {
    return { validationError: isProjectAdminValidationError };
  }

  const isBlueprintManagerValidationError = validateRole(
    isBlueprintManager,
    'isBlueprintManager',
  );
  if (isBlueprintManagerValidationError) {
    return { validationError: isBlueprintManagerValidationError };
  }

  const isComponentManagerValidationError = validateRole(
    isComponentManager,
    'isComponentManager',
  );
  if (isComponentManagerValidationError) {
    return { validationError: isComponentManagerValidationError };
  }

  const isLayoutManagerValidationError = validateRole(isLayoutManager, 'isLayoutManager');
  if (isLayoutManagerValidationError) {
    return { validationError: isLayoutManagerValidationError };
  }

  const isFragmentManagerValidationError = validateRole(
    isFragmentManager,
    'isFragmentManager',
  );
  if (isFragmentManagerValidationError) {
    return { validationError: isFragmentManagerValidationError };
  }

  const usernameValidationResult = await validateUsername(username);
  if (typeof usernameValidationResult === 'string') {
    return { validationError: usernameValidationResult };
  }

  // Since this is for creation, lets ensure that a membership does not already exist for the user.
  const memberships = await project.getMemberships({
    where: {
      userId: usernameValidationResult.id,
    },
  });

  if (memberships.length !== 0) {
    return { validationError: 'membership already exists' };
  }
  return { validationError: '', user: usernameValidationResult };
};

export default createMembershipValidation;
