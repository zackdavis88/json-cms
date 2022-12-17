import { validateRole } from 'src/controllers/membership/validation_utils';

type UpdateMembershipValidation = (
  isProjectAdmin: unknown,
  isBlueprintManager: unknown,
  isComponentManager: unknown,
  isLayoutManager: unknown,
  isFragmentManager: unknown,
) => string | void;

const updateMembershipValidation: UpdateMembershipValidation = (
  isProjectAdmin,
  isBlueprintManager,
  isComponentManager,
  isLayoutManager,
  isFragmentManager,
) => {
  const noUpdateData =
    isProjectAdmin === undefined &&
    isBlueprintManager === undefined &&
    isComponentManager === undefined &&
    isLayoutManager === undefined &&
    isFragmentManager === undefined;
  if (noUpdateData) {
    return 'input contains no update data';
  }

  const isProjectAdminValidationError = validateRole(isProjectAdmin, 'isProjectAdmin');
  if (isProjectAdminValidationError) {
    return isProjectAdminValidationError;
  }

  const isBlueprintManagerValidationError = validateRole(
    isBlueprintManager,
    'isBlueprintManager',
  );
  if (isBlueprintManagerValidationError) {
    return isBlueprintManagerValidationError;
  }

  const isComponentManagerValidationError = validateRole(
    isComponentManager,
    'isComponentManager',
  );
  if (isComponentManagerValidationError) {
    return isComponentManagerValidationError;
  }

  const isLayoutManagerValidationError = validateRole(isLayoutManager, 'isLayoutManager');
  if (isLayoutManagerValidationError) {
    return isLayoutManagerValidationError;
  }

  const isFragmentManagerValidationError = validateRole(
    isFragmentManager,
    'isFragmentManager',
  );
  if (isFragmentManagerValidationError) {
    return isFragmentManagerValidationError;
  }
};

export default updateMembershipValidation;
