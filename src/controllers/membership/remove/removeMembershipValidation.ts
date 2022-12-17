import { confirmationValidation } from 'src/controllers/validation_utils';

type RemoveMembershipValidation = (confirm: unknown) => string | void;

const removeMembershipValidation: RemoveMembershipValidation = (confirm) => {
  return confirmationValidation(confirm, true);
};

export default removeMembershipValidation;
