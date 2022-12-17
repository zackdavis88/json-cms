import { Request, Response } from 'express';
import createMembershipValidation from './createMembershipValidation';

const createMembership = async (req: Request, res: Response) => {
  try {
    const project = req.requestedProject;
    const {
      username,
      isProjectAdmin,
      isBlueprintManager,
      isComponentManager,
      isLayoutManager,
      isFragmentManager,
    } = req.body;
    const { validationError, user } = await createMembershipValidation(
      project,
      username,
      isProjectAdmin,
      isBlueprintManager,
      isComponentManager,
      isLayoutManager,
      isFragmentManager,
    );
    if (validationError) {
      return res.validationError(validationError);
    }

    const newMembership = {
      userId: user?.id,
      isProjectAdmin,
      isBlueprintManager,
      isComponentManager,
      isLayoutManager,
      isFragmentManager,
    };
    const membership = await project.createMembership(newMembership);

    const membershipData = {
      membership: {
        id: membership.id,
        user: {
          username: user?.username,
          displayName: user?.displayName,
        },
        project: {
          id: project.id,
          name: project.name,
        },
        isProjectAdmin: membership.isProjectAdmin,
        isBlueprintManager: membership.isBlueprintManager,
        isComponentManager: membership.isComponentManager,
        isLayoutManager: membership.isLayoutManager,
        isFragmentManager: membership.isFragmentManager,
      },
    };

    res.success('membership has been successfully created', membershipData);
  } catch (error) {
    res.fatalError('fatal error while creating membership');
  }
};

export default createMembership;
