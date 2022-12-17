import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

interface MembershipUpdatePayload {
  isProjectAdmin?: unknown;
  isBlueprintManager?: unknown;
  isComponentManager?: unknown;
  isLayoutManager?: unknown;
  isFragmentManager?: unknown;
}

describe('[Membership] Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testMembership: Membership;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let payload: MembershipUpdatePayload;

    beforeAll(async () => {
      const authUser = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(authUser);
      testMembership = await testProject.createMembership({
        userId: testUser.id,
        isFragmentManager: true,
      });
      notAuthorizedUser = await testHelper.createTestUser();
      notAuthorizedToken = testHelper.generateToken(notAuthorizedUser);
      authToken = testHelper.generateToken(authUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships/${testMembership.id}`;
      payload = {
        isBlueprintManager: true,
        isFragmentManager: false,
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests that have an invalid project id', (done) => {
      apiRoute = '/projects/wrong/memberships';
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the project is not found', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests that have an invalid membership id', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/badId`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested membership id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the membership is not found', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testHelper.generateUUID()}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
        401,
        {
          error: 'you do not have permission to update this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from users that do not have isProjectAdmin permissions', (done) => {
      testProject.createMembership({ userId: notAuthorizedUser.id }).then(() => {
        request(serverUrl).post(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
          401,
          {
            error: 'you do not have permission to update this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
      });
    });

    it('should reject requests that contain no update data', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'input contains no update data',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when isProjectAdmin input, if provided, is not a boolean', (done) => {
      payload.isProjectAdmin = 'yes, please';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isProjectAdmin must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isBlueprintManager input, if provided, is not a boolean', (done) => {
      payload.isBlueprintManager = 123456;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isBlueprintManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isComponentManager input, if provided, is not a boolean', (done) => {
      payload.isComponentManager = 'do it';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isComponentManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isLayoutManager input, if provided, is not a boolean', (done) => {
      payload.isLayoutManager = {};
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isLayoutManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isFragmentManager input, if provided, is not a boolean', (done) => {
      payload.isFragmentManager = null;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isFragmentManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a membership', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          assert.strictEqual(message, 'membership has been successfully updated');
          assert(membership);
          assert.strictEqual(membership.id, testMembership.id);
          assert(membership.project);
          assert.strictEqual(membership.project.id, testProject.id);
          assert.strictEqual(membership.project.name, testProject.name);
          assert(membership.user);
          assert.strictEqual(membership.user.username, testUser.username);
          assert.strictEqual(membership.user.displayName, testUser.displayName);
          assert.strictEqual(membership.isProjectAdmin, testMembership.isProjectAdmin);
          assert.strictEqual(membership.isBlueprintManager, payload.isBlueprintManager);
          assert.strictEqual(
            membership.isComponentManager,
            testMembership.isComponentManager,
          );
          assert.strictEqual(membership.isLayoutManager, testMembership.isLayoutManager);
          assert.strictEqual(membership.isFragmentManager, payload.isFragmentManager);
          assert.strictEqual(
            membership.createdOn,
            testMembership.createdOn.toISOString(),
          );
          assert(membership.createdOn);
          done();
        });
    });
  });
});
