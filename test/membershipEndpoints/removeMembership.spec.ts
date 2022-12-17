import assert from 'assert';
import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
import { Membership, Project, User } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

interface RemovePayload {
  confirm?: unknown;
}

describe('[Membership] Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let testProject: Project;
    let testUser: User;
    let testMembership: Membership;
    let authToken: string;
    let notAuthorizedUser: User;
    let notAuthorizedToken: string;
    let payload: RemovePayload;

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
        confirm: true,
      };
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from users that are not project members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', notAuthorizedToken).expect(
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
        request(serverUrl)
          .delete(apiRoute)
          .set('x-auth-token', notAuthorizedToken)
          .expect(
            401,
            {
              error: 'you do not have permission to update this project',
              errorType: ErrorTypes.AUTHORIZATION,
            },
            done,
          );
      });
    });

    it('should reject requests when confirm is missing', (done) => {
      payload.confirm = undefined;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not a boolean', (done) => {
      payload.confirm = 'true';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not true', (done) => {
      payload.confirm = false;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must have a value of true',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a membership', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          assert.strictEqual(message, 'membership has been successfully removed');
          assert(membership);
          assert.strictEqual(membership.id, testMembership.id);
          assert(membership.project);
          assert.strictEqual(membership.project.id, testProject.id);
          assert.strictEqual(membership.project.name, testProject.name);
          assert(membership.user);
          assert.strictEqual(membership.user.username, testUser.username);
          assert.strictEqual(membership.user.displayName, testUser.displayName);
          Membership.findOne({ where: { id: testMembership.id } }).then((membership) => {
            if (membership) {
              return done('membership was not removed');
            }

            done();
          });
        });
    });
  });
});
