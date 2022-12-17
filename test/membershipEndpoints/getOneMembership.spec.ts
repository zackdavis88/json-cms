import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

describe('[Membership] Get One', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testMembership: Membership;
    let authToken: string;

    beforeAll(async () => {
      const authUser = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();
      testProject = await testHelper.createTestProject(authUser);
      testMembership = await testProject.createMembership({
        userId: testUser.id,
        isFragmentManager: true,
      });
      authToken = testHelper.generateToken(authUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships/${testMembership.id}`;
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).get(apiRoute).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return a membership', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          assert.strictEqual(message, 'membership has been successfully retrieved');
          assert(membership);
          assert.strictEqual(membership.id, testMembership.id);
          assert(membership.project);
          assert.strictEqual(membership.project.id, testProject.id);
          assert.strictEqual(membership.project.name, testProject.name);
          assert(membership.user);
          assert.strictEqual(membership.user.username, testUser.username);
          assert.strictEqual(membership.user.displayName, testUser.displayName);
          assert.strictEqual(membership.isProjectAdmin, testMembership.isProjectAdmin);
          assert.strictEqual(
            membership.isBlueprintManager,
            testMembership.isBlueprintManager,
          );
          assert.strictEqual(
            membership.isComponentManager,
            testMembership.isComponentManager,
          );
          assert.strictEqual(membership.isLayoutManager, testMembership.isLayoutManager);
          assert.strictEqual(
            membership.isFragmentManager,
            testMembership.isFragmentManager,
          );
          assert.strictEqual(
            membership.createdOn,
            testMembership.createdOn.toISOString(),
          );
          done();
        });
    });
  });
});
