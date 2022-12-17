import { Request, Response } from 'express';
import updateMembershipValidation from './updateMembershipValidation';

const updateMembership = async (req: Request, res: Response) => {
  try {
    const membership = req.requestedMembership;
    const project = req.requestedProject;
    const user = await membership.getUser();
    const {
      isProjectAdmin,
      isBlueprintManager,
      isComponentManager,
      isLayoutManager,
      isFragmentManager,
    } = req.body;
    const validationError = updateMembershipValidation(
      isProjectAdmin,
      isBlueprintManager,
      isComponentManager,
      isLayoutManager,
      isFragmentManager,
    );
    if (validationError) {
      return res.validationError(validationError);
    }

    if (typeof isProjectAdmin === 'boolean') {
      membership.isProjectAdmin = isProjectAdmin;
    }

    if (typeof isBlueprintManager === 'boolean') {
      membership.isBlueprintManager = isBlueprintManager;
    }

    if (typeof isComponentManager === 'boolean') {
      membership.isComponentManager = isComponentManager;
    }

    if (typeof isLayoutManager === 'boolean') {
      membership.isLayoutManager = isLayoutManager;
    }

    if (typeof isFragmentManager === 'boolean') {
      membership.isFragmentManager = isFragmentManager;
    }

    membership.updatedOn = new Date();
    await membership.save();

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

    res.success('membership has been successfully updated', membershipData);
  } catch (error) {
    res.fatalError('fatal error while updating membership');
  }
};

export default updateMembership;
