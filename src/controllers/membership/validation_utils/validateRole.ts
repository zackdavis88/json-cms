type ValidateRole = (role: unknown, roleName: string) => string | void;

export const validateRole: ValidateRole = (role, roleName) => {
  if (role === undefined) {
    return;
  }

  if (typeof role !== 'boolean') {
    return `${roleName} must be a boolean`;
  }
};
