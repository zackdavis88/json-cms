import { Request, Response, NextFunction } from 'express';
import { uuidValidation } from 'src/controllers/validation_utils';

export const getRequestedMembership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const project = req.requestedProject;
  const membershipId = req.params.membershipId;

  const uuidValidationError = uuidValidation(membershipId, 'membership');
  if (uuidValidationError) {
    return res.validationError(uuidValidationError);
  }

  try {
    const membership = (await project.getMemberships({ where: { id: membershipId } }))[0];

    if (!membership) {
      return res.notFoundError('requested membership not found');
    }

    req.requestedMembership = membership;
    next();
  } catch (getRequestedMembershipFatalError) {
    res.fatalError('fatal error while getting requested membership');
  }
};

const getOneMembership = async (req: Request, res: Response) => {
  try {
    const membership = req.requestedMembership;
    const project = req.requestedProject;
    const user = await membership.getUser();

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
        isProjectAdmin: membership.isProjectAdmin,
        isBlueprintManager: membership.isBlueprintManager,
        isComponentManager: membership.isComponentManager,
        isLayoutManager: membership.isLayoutManager,
        isFragmentManager: membership.isFragmentManager,
        createdOn: membership.createdOn,
        updatedOn: membership.updatedOn,
      },
    };

    res.success('membership has been successfully retrieved', membershipData);
  } catch (error) {
    res.fatalError('fatal error while getting membership');
  }
};

export default getOneMembership;
