import { Request, Response } from 'express';
import removeMembershipValidation from './removeMembershipValidation';

const removeMembership = async (req: Request, res: Response) => {
  const membership = req.requestedMembership;
  const project = req.requestedProject;
  const user = membership.user;
  const confirm = req.body.confirm;

  const validationError = removeMembershipValidation(confirm);
  if (validationError) {
    return res.validationError(validationError);
  }

  try {
    await membership.destroy();

    const membershipData = {
      membership: {
        id: membership.id,
        project: {
          id: project.id,
          name: project.name,
        },
        user: {
          username: user.username,
          displayName: user.displayName,
        },
      },
    };

    res.success('membership has been successfully removed', membershipData);
  } catch (error) {
    res.fatalError('fatal error while removing membership');
  }
};

export default removeMembership;
